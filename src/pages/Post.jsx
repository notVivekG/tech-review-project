import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container, CommentSection } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {

    

    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    const safeRating = post?.rating ? Number(post.rating) : 0;
    const filledStars = Math.round(Math.min(Math.max(safeRating, 0), 5));

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    if (post) {
        console.log("featuredImage:", post.featuredImage);
        console.log(
        "Image URL:",
        post.featuredImage
            ? appwriteService.getFilePreview(post.featuredImage)
            : null,
        );
    }

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="py-10">
        <Container>
            <div className="w-full flex justify-center mb-6 relative bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            {post.featuredImage && (
                <img
                src={appwriteService.getFilePreview(post.featuredImage)}
                alt={post.productName || post.title}
                className="rounded-xl max-h-72 w-full object-cover"
                />
            )}
            </div>
            <div className="w-full mb-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                <h1 className="text-3xl font-semibold text-slate-50">
                    {post.productName || post.title}
                </h1>
                <p className="mt-1 text-slate-400 text-sm">
                    Review title: <span className="text-slate-200">{post.title}</span>
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                    <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-emerald-300 text-xs uppercase tracking-wide">
                    {post.category || "Uncategorized"}
                    </span>
                    <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                        key={star}
                        className={
                            star <= filledStars ? "text-amber-400 text-base" : "text-slate-700 text-base"
                        }
                        >
                        ★
                        </span>
                    ))}
                    {safeRating > 0 && (
                        <span className="ml-1 text-xs text-slate-400">{safeRating}/5</span>
                    )}
                    </div>
                    <span className="text-xs text-slate-400">
                    by {post.reviewerName || userData?.name || "Anonymous"}
                    </span>
                </div>
                </div>

                {isAuthor && (
                <div className="flex flex-wrap gap-3 mt-2 md:mt-0 md:justify-end">
                    <Link to={`/edit-post/${post.$id}`}>
                    <Button
                        bgColor="bg-slate-900/80"
                        className="border border-emerald-500/60 text-emerald-300 rounded-full px-4 py-1.5 text-sm hover:bg-emerald-500/10"
                    >
                        Edit review
                    </Button>
                    </Link>
                    <Button
                    bgColor="bg-red-500/90"
                    className="rounded-full px-4 py-1.5 text-sm hover:bg-red-500"
                    onClick={deletePost}
                    >
                    Delete review
                    </Button>
                </div>
                )}
            </div>
            </div>
            <div className="mt-6 prose prose-invert max-w-none prose-p:text-slate-200">
            {parse(post.content)}
            </div>

            {/* Comment Section */}
            <CommentSection postId={post.$id} postAuthorId={post.userId} />
        </Container>
        </div>
    ) : null;
}
