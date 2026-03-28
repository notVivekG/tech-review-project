import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { searchProductImages, urlToFile } from "../../services/imageSearch";
import { Sparkles, X, Loader2, Clock } from "lucide-react";

const COOLDOWN_KEY = "autopick_cooldown";
const COOLDOWN_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

function PostForm({ post }) {
  const { register, handleSubmit, setValue, watch, getValues, control } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.slug || "",
        content: post?.content || "",
        status: post?.status || "active",
        productName: post?.productName || "",
        category: post?.category || "",
        rating: post?.rating || 4,
      },
    });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const authStatus = useSelector((state) => state.auth.status);

  const ratingValue = watch("rating");
  const productNameValue = watch("productName");

  // Auto-pick image states
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [autoPickedFile, setAutoPickedFile] = useState(null);
  
  // Cooldown states
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Check and update cooldown timer
  useEffect(() => {
    const checkCooldown = () => {
      const lastUsed = localStorage.getItem(COOLDOWN_KEY);
      if (lastUsed) {
        const elapsed = Date.now() - parseInt(lastUsed, 10);
        const remaining = COOLDOWN_DURATION - elapsed;
        if (remaining > 0) {
          setCooldownRemaining(remaining);
        } else {
          setCooldownRemaining(0);
          localStorage.removeItem(COOLDOWN_KEY);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);


  // Format remaining time as MM:SS
  const formatCooldown = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isOnCooldown = cooldownRemaining > 0;
  const canAutoPick = productNameValue?.trim() && !isOnCooldown; 


  // Search for images based on product name
  const handleAutoPickImage = async () => {
    if (!productNameValue?.trim()) {
      alert("Please enter a product name first");
      return;
    }

    setIsSearching(true);
    setShowImagePicker(true);
    setSearchResults([]);

    try {
      const results = await searchProductImages(productNameValue);
      setSearchResults(results);
      
      // Set cooldown after successful search
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
      setCooldownRemaining(COOLDOWN_DURATION);
    } catch (error) {
      console.error("Image search error:", error);
      alert(error.message || "Failed to search images");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle image selection from search results
  const handleSelectImage = async (image) => {
    setSelectedImage(image);
    try {
      const file = await urlToFile(image.url, `${productNameValue}-image.jpg`);
      setAutoPickedFile(file);
      setShowImagePicker(false);
    } catch (error) {
      console.error("Failed to process image:", error);
      alert("Failed to process image");
    }
  };

  // Clear auto-picked image
  const clearAutoPickedImage = () => {
    setSelectedImage(null);
    setAutoPickedFile(null);
  };

  const submit = async (data) => {
    if (!userData) {
      alert("Please login first");
      return;
    }

    try {
      // upload image: prefer auto-picked, then manual upload
      let file = null;
      if (autoPickedFile) {
        file = await appwriteService.uploadFile(autoPickedFile);
      } else if (data.image && data.image.length > 0) {
        file = await appwriteService.uploadFile(data.image[0]);
      }

      // derive reviewer name from auth or existing post
      const reviewerName = post?.reviewerName || userData?.name || "Anonymous";

      /* ================= UPDATE POST ================= */
      if (post) {
        // delete old image if new image uploaded
        if (file && post.featuredImage) {
          await appwriteService.deleteFile(post.featuredImage);
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          title: data.title,
          slug: data.slug,
          content: data.content,
          status: data.status,
          featuredImage: file ? file.$id : post.featuredImage,
          productName: data.productName,
          category: data.category,
          rating: Number(data.rating) || 0,
          reviewerName,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      } else {
        /* ================= CREATE POST ================= */
        const dbPost = await appwriteService.createPost({
          title: data.title,
          slug: data.slug,
          content: data.content,
          status: data.status,
          featuredImage: file ? file.$id : null,
          userId: userData.$id,
          productName: data.productName,
          category: data.category,
          rating: Number(data.rating) || 0,
          reviewerName,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    } catch (error) {
      console.error("Post submit error:", error);
    }
  };

  const slugTransform = useCallback((value) => {
    if (typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s+/g, "-");
    }
    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), {
          shouldValidate: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl px-6 py-6 md:px-8 md:py-8 text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-xl">&gt;</span>
          <h2 className="text-xl font-semibold tracking-tight">New Review</h2>
        </div>
      </div>

      {/* Product name + category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          label="Product Name"
          placeholder="e.g., VS Code"
          className="bg-slate-900/60 text-slate-100 border-slate-700 placeholder:text-slate-500"
          {...register("productName", { required: true })}
        />

        <Select
          options={[
            "Select category",
            "Software",
            "Hardware",
            "AI Tools",
            "Developer Tools",
            "Productivity",
          ]}
          label="Category"
          {...register("category", { required: true })}
        />
      </div>

      {/* Rating */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-300 mb-2">Your Rating</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue("rating", star, { shouldValidate: true })}
              className="focus:outline-none transform transition-transform duration-150 hover:scale-110"
            >
              <span
                className={
                  (star <= (ratingValue || 0)
                    ? "text-amber-400"
                    : "text-slate-700") + " text-3xl"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register("rating", { required: true })} />
      </div>

      {/* Review title */}
      <div className="mb-4">
        <Input
          label="Review Title"
          placeholder="Sum up your experience"
          className="bg-slate-900/60 text-slate-100 border-slate-700 placeholder:text-slate-500"
          {...register("title", { required: true })}
        />
      </div>

      {/* Review body */}
      <div className="mb-4">
        <RTE
          label="Your Review"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>

      {/* Hidden slug + status to keep backend happy */}
      <input type="hidden" {...register("slug", { required: true })} />
      <input
        type="hidden"
        value={post?.status || "active"}
        {...register("status")}
      />

      {/* Optional image preview (if editing) */}
      {post?.featuredImage && (
        <div className="w-full mb-6">
          <img
            src={appwriteService.getFilePreview(post.featuredImage)}
            alt={post.title}
            className="rounded-lg max-h-48 object-cover w-full"
          />
        </div>
      )}

      {/* Upload image */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-300">
            Product Image (optional)
          </label>
          <button
            type="button"
            onClick={handleAutoPickImage}
            disabled={!canAutoPick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
    ${
      isOnCooldown
        ? "bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed animate-pulse"
        : "bg-linear-to-r from-purple-500/20 to-emerald-500/20 border border-purple-500/40 text-purple-300 hover:from-purple-500/30 hover:to-emerald-500/30"
    }`}
          >
            {isOnCooldown ? (
              <>
                <Clock className="w-4 h-4" />
                Available in {formatCooldown(cooldownRemaining)}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-pick Image
              </>
            )}
          </button>
        </div>

        {/* Auto-picked image preview */}
        {selectedImage && (
          <div className="mb-4 relative">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="w-full h-48 object-cover rounded-lg border border-emerald-500/40"
            />
            <button
              type="button"
              onClick={clearAutoPickedImage}
              className="absolute top-2 right-2 p-1.5 bg-slate-900/80 rounded-full text-slate-300 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="mt-1 text-xs text-slate-500">
              Photo by{" "}
              <a
                href={selectedImage.photographerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline"
              >
                {selectedImage.photographer}
              </a>{" "}
              on Unsplash
            </p>
          </div>
        )}

        {!selectedImage && (
          <>
            <Input
              type="file"
              accept="image/*"
              className="cursor-pointer file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20"
              {...register("image")}
            />
            <p className="mt-1 text-xs text-slate-500">
              Upload manually or use Auto-pick to find an image online.
            </p>
          </>
        )}
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">
                Pick an image for "{productNameValue}"
              </h3>
              <button
                type="button"
                onClick={() => setShowImagePicker(false)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="mt-3 text-slate-400">Searching for images...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No images found. Try a different product name.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {searchResults.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleSelectImage(img)}
                    className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-400 transition-all"
                  >
                    <img
                      src={img.thumb}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-slate-500 text-center">
              Images provided by Unsplash
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-3">
        <Button
          type="button"
          bgColor="bg-transparent"
          textColor="text-emerald-400"
          className="border border-emerald-500/60 rounded-lg px-5 py-2 hover:bg-emerald-500/10"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          bgColor="bg-emerald-400"
          textColor="text-slate-950"
          className="rounded-lg px-6 py-2 font-semibold tracking-wide hover:bg-emerald-300"
        >
          {post ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}

export default PostForm;
