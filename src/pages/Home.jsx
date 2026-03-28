import React, {useEffect, useState, useMemo, useRef} from 'react'
import appwriteService from '../appwrite/config'
import { Container, PostCard } from '../components'
import { Query } from 'appwrite'

// Animated counter hook
function useAnimatedCounter(targetValue, duration = 1500) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (targetValue === 0) return;

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = timestamp - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - percentage, 3);
            const currentCount = Math.floor(easeOut * targetValue);
            
            setCount(currentCount);
            countRef.current = currentCount;

            if (percentage < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(targetValue);
            }
        };

        startTimeRef.current = null;
        requestAnimationFrame(animate);
    }, [targetValue, duration]);

    return count;
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString();
}

const CATEGORIES = [
    'All',
    'Software',
    'Hardware',
    'Mobile Apps',
    'Web Tools',
    'AI/ML',
    'DevOps',
    'Design',
    'Other'
];

const RATINGS = [
    { label: 'All Ratings', value: 0 },
    { label: '5 Stars', value: 5 },
    { label: '4+ Stars', value: 4 },
    { label: '3+ Stars', value: 3 },
    { label: '2+ Stars', value: 2 },
    { label: '1+ Stars', value: 1 },
];

function Home() {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedRating, setSelectedRating] = useState(0);
    const [stats, setStats] = useState({ reviews: 0, reviewers: 0, products: 0 });

    useEffect(() => {
        appwriteService.getPosts([
            Query.equal('status', 'active'),
            Query.orderDesc('$createdAt'),
        ]).
        then(response => {
            if (response.documents) {
                setPosts(response.documents);
                
                // Calculate live stats
                const reviews = response.documents.length;
                const uniqueReviewers = new Set(response.documents.map(p => p.userId)).size;
                const uniqueProducts = new Set(response.documents.map(p => p.productName?.toLowerCase())).size;
                
                setStats({
                    reviews,
                    reviewers: uniqueReviewers,
                    products: uniqueProducts
                });
            } else {
                setPosts([]);
            }
        })
    }, []);

    // Animated counters
    const animatedReviews = useAnimatedCounter(stats.reviews);
    const animatedReviewers = useAnimatedCounter(stats.reviewers);
    const animatedProducts = useAnimatedCounter(stats.products);

    // Filter posts based on selected filters
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const categoryMatch = selectedCategory === 'All' || post.category === selectedCategory;
            const ratingMatch = selectedRating === 0 || (Number(post.rating) || 0) >= selectedRating;
            return categoryMatch && ratingMatch;
        });
    }, [posts, selectedCategory, selectedRating]);

    return (
        <div className="py-10">
            {/* Hero section */}
            <section className="relative">
                {/* Soft emerald glow orbs behind hero content */}
                <>
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-emerald-500/15 rounded-full blur-3xl" />
                    <div className="pointer-events-none absolute top-1/4 right-1/4 w-75 h-75 bg-sky-400/15 rounded-full blur-3xl" />
                </>
                <Container>
                    <div className="relative z-10 py-16 text-center">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold  text-slate-50 max-w-4xl mx-auto leading-tight">
                            Discover the
                            <br />
                            <span className="minecraft-heading leading-[1.05]  bg-linear-to-r from-emerald-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                best tech tools
                            </span>
                            <br />
                            reviewed by developers
                        </h1>

                        <p className="mt-6 text-slate-300 max-w-2xl mx-auto text-base md:text-lg">
                            No fluff. No paid promotions. Just honest reviews from developers who actually use these tools daily.
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-10 text-left">
                            <div>
                                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Reviews</div>
                                <div className="mt-1 text-2xl font-semibold text-slate-50 tabular-nums">
                                    {formatNumber(animatedReviews)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Reviewers</div>
                                <div className="mt-1 text-2xl font-semibold text-slate-50 tabular-nums">
                                    {formatNumber(animatedReviewers)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Products</div>
                                <div className="mt-1 text-2xl font-semibold text-slate-50 tabular-nums">
                                    {formatNumber(animatedProducts)}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Reviews section */}
            <section className="mt-16">
                <Container>
                    <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-slate-50">Latest Product Reviews</h2>

                    {/* Filters */}
                    <div className="mb-8 flex flex-wrap items-center gap-4">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-400">Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-400">Rating:</label>
                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(Number(e.target.value))}
                                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                                {RATINGS.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(selectedCategory !== 'All' || selectedRating !== 0) && (
                            <button
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setSelectedRating(0);
                                }}
                                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}

                        {/* Results count */}
                        <span className="text-sm text-slate-500 ml-auto">
                            {filteredPosts.length} {filteredPosts.length === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>

                    {posts.length === 0 ? (
                        <p className="text-slate-300">Login to read product reviews.</p>
                    ) : filteredPosts.length === 0 ? (
                        <p className="text-slate-400">No reviews match your filters.</p>
                    ) : (
                        <div className="flex flex-wrap gap-6 justify-start">
                            {filteredPosts.map((post) => (
                                <PostCard key={post.$id} {...post} />
                            ))}
                        </div>
                    )}
                </Container>
            </section>
        </div>
    );
}

export default Home
