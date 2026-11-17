"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { CommentItem } from "@/types";
import { fetchComments, postComment } from "@/lib/api";

export default function CommentsSection({ mediaId }: { mediaId: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mediaId) {
      loadComments();
    }
  }, [mediaId]);

  const loadComments = async () => {
    const data = await fetchComments(mediaId);
    setComments(data);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    const newComment = await postComment(mediaId, content.trim(), "Streamly User");
    if (newComment) {
      setComments([newComment, ...comments]);
      setContent("");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center space-x-2 text-lg font-semibold text-white">
        <MessageSquare className="w-5 h-5 text-primary" />
        <span>{comments.length} Comments</span>
      </div>

      {/* Input Form */}
      <form onSubmit={handlePostComment} className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden flex-shrink-0">
          <img
            src="https://api.dicebear.com/7.x/identicon/svg?seed=streamly_user"
            alt="Current User"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col space-y-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment to the discussion..."
            className="w-full bg-surface border border-border text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-all placeholder:text-neutral-500"
          />
          <div className="flex justify-end space-x-2">
            {content.trim() && (
              <button
                type="button"
                onClick={() => setContent("")}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        {comments.length === 0 ? (
          <div className="text-sm text-neutral-500 text-center py-6">
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex space-x-3 items-start">
              <div className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden flex-shrink-0">
                <img
                  src={c.user_avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.user_name}`}
                  alt={c.user_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-white">{c.user_name}</span>
                  <span className="text-[11px] text-neutral-500">
                    {new Date(c.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 mt-1 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
