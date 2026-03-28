import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";

// Single Comment component with reply functionality
function Comment({ comment, allComments, postAuthorId, userData, onReply, onDelete, depth = 0 }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAuthor = comment.userId === postAuthorId;
    const isOwner = userData && comment.userId === userData.$id;
    const replies = allComments.filter((c) => c.parentId === comment.$id);

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim() || !userData) return;
        
        setIsSubmitting(true);
        try {
            await onReply(comment.$id, replyContent);
            setReplyContent("");
            setShowReplyBox(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`${depth > 0 ? "ml-6 border-l-2 border-slate-700/50 pl-4" : ""}`}>
            <div className="py-3">
                {/* Comment header */}
                <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${isAuthor ? "text-emerald-400" : "text-slate-300"}`}>
                        {comment.userName || "Anonymous"}
                    </span>
                    {isAuthor && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] uppercase">
                            OP
                        </span>
                    )}
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">{timeAgo(comment.$createdAt)}</span>
                </div>

                {/* Comment content */}
                <p className="mt-1 text-slate-200 text-sm leading-relaxed">
                    {comment.content}
                </p>

                {/* Comment actions */}
                <div className="mt-2 flex items-center gap-4 text-xs">
                    {userData && (
                        <button
                            onClick={() => setShowReplyBox(!showReplyBox)}
                            className="text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                            Reply
                        </button>
                    )}
                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.$id)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>

                {/* Reply input box */}
                {showReplyBox && (
                    <div className="mt-3">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                            rows={2}
                        />
                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={handleReplySubmit}
                                disabled={isSubmitting || !replyContent.trim()}
                                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? "Posting..." : "Reply"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowReplyBox(false);
                                    setReplyContent("");
                                }}
                                className="px-3 py-1 text-slate-400 text-xs hover:text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Nested replies */}
            {replies.length > 0 && (
                <div className="mt-1">
                    {replies.map((reply) => (
                        <Comment
                            key={reply.$id}
                            comment={reply}
                            allComments={allComments}
                            postAuthorId={postAuthorId}
                            userData={userData}
                            onReply={onReply}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Main CommentSection component
export default function CommentSection({ postId, postAuthorId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userData = useSelector((state) => state.auth.userData);

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const response = await appwriteService.getComments(postId);
                setComments(response.documents || []);
            } catch (error) {
                console.error("Failed to fetch comments:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchComments();
        }
    }, [postId]);

    // Add new comment
    const handleSubmitComment = async () => {
        if (!newComment.trim() || !userData) return;

        setIsSubmitting(true);
        try {
            const comment = await appwriteService.createComment({
                postId,
                parentId: null,
                userId: userData.$id,
                userName: userData.name || userData.email?.split("@")[0] || "Anonymous",
                content: newComment,
            });
            setComments((prev) => [...prev, comment]);
            setNewComment("");
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reply to a comment
    const handleReply = async (parentId, content) => {
        if (!userData) return;

        const reply = await appwriteService.createComment({
            postId,
            parentId,
            userId: userData.$id,
            userName: userData.name || userData.email?.split("@")[0] || "Anonymous",
            content,
        });
        setComments((prev) => [...prev, reply]);
    };

    // Delete a comment
    const handleDelete = async (commentId) => {
        const success = await appwriteService.deleteComment(commentId);
        if (success) {
            // Remove the comment and all its nested replies
            const idsToRemove = new Set([commentId]);
            let changed = true;
            while (changed) {
                changed = false;
                comments.forEach((c) => {
                    if (c.parentId && idsToRemove.has(c.parentId) && !idsToRemove.has(c.$id)) {
                        idsToRemove.add(c.$id);
                        changed = true;
                    }
                });
            }
            setComments((prev) => prev.filter((c) => !idsToRemove.has(c.$id)));
        }
    };

    // Get only top-level comments (no parent)
    const topLevelComments = comments.filter((c) => !c.parentId);

    return (
        <div className="mt-10 border-t border-slate-800 pt-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <span>💬</span> Discussion
                {comments.length > 0 && (
                    <span className="text-sm font-normal text-slate-500">
                        ({comments.length} {comments.length === 1 ? "comment" : "comments"})
                    </span>
                )}
            </h2>

            {/* New comment input */}
            {userData ? (
                <div className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts or ask a question..."
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                        rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                        <button
                            onClick={handleSubmitComment}
                            disabled={isSubmitting || !newComment.trim()}
                            className="px-4 py-2 bg-emerald-500 text-slate-900 text-sm font-medium rounded-full hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center">
                    <p className="text-slate-400 text-sm">
                        Please{" "}
                        <a href="/login" className="text-emerald-400 hover:underline">
                            log in
                        </a>{" "}
                        to join the discussion.
                    </p>
                </div>
            )}

            {/* Comments list */}
            {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading comments...</div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    No comments yet. Be the first to share your thoughts!
                </div>
            ) : (
                <div className="space-y-1 divide-y divide-slate-800/50">
                    {topLevelComments.map((comment) => (
                        <Comment
                            key={comment.$id}
                            comment={comment}
                            allComments={comments}
                            postAuthorId={postAuthorId}
                            userData={userData}
                            onReply={handleReply}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
