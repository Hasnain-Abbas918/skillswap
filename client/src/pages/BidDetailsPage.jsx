import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, Send, Layers, User, MessageSquare } from 'lucide-react';
import Loader from '../components/common/Loader';

const BidDetailsPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useSelector((s) => s.auth);
  const [bid,        setBid]     = useState(null);
  const [reviews,    setReviews] = useState({ reviews: [], averageRating: 0, total: 0 });
  const [message,    setMessage] = useState('');
  const [loading,    setLoading] = useState(true);
  const [sending,    setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const bidRes = await api.get(`/bids/${id}`);
        setBid(bidRes.data);
        if (bidRes.data?.creator?.id) {
          const rr = await api.get(`/reviews/user/${bidRes.data.creator.id}`)
            .catch(() => ({ data: { reviews: [], averageRating: 0, total: 0 } }));
          setReviews(rr.data);
        }
      } catch {
        toast.error('Bid not found');
        navigate('/bids');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const sendRequest = async () => {
    if (!message.trim()) return toast.error('Please write a message');
    setSending(true);
    try {
      await api.post('/requests', { bidId: bid.id, receiverId: bid.creator.id, message });
      toast.success('Request sent!');
      navigate('/bids');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
    setSending(false);
  };

  if (loading) return <div className="p-8"><Loader text="Loading bid details..." /></div>;
  if (!bid)    return null;

  const isOwner = user?.id === bid.creator?.id;

  return (
    <div className="min-h-screen bg-[#f0f7f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .input-teal:focus { outline: none; border-color: #2d7d6f; box-shadow: 0 0 0 3px rgba(45,125,111,0.12); }
        .btn-teal { transition: all 0.25s ease; }
        .btn-teal:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(45,125,111,0.3); }
        .card-teal { background: white; border-radius: 1.5rem; border: 1px solid rgba(45,125,111,0.08); box-shadow: 0 4px 24px rgba(45,125,111,0.06); }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; transform: translateY(16px); }
        .fade-up-d1 { animation: fadeUp 0.6s ease 0.1s forwards; opacity: 0; transform: translateY(16px); }
        .fade-up-d2 { animation: fadeUp 0.6s ease 0.2s forwards; opacity: 0; transform: translateY(16px); }
        .fade-up-d3 { animation: fadeUp 0.6s ease 0.3s forwards; opacity: 0; transform: translateY(16px); }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .star-fill { color: #fbbf24; fill: #fbbf24; }
        .star-empty { color: #e5e7eb; }
      `}</style>

      <div className="max-w-3xl mx-auto p-6 pt-8">

        {/* Back */}
        <button
          onClick={() => navigate('/bids')}
          className="fade-up flex items-center gap-2 text-[#4a6b67] hover:text-[#2d7d6f] text-sm font-semibold mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Bids
        </button>

        {/* ── BID CARD ── */}
        <div className="fade-up-d1 card-teal p-7 mb-5">

          {/* Skills badges */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="bg-blue-50 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full">
              {bid.skillOffered}
            </span>
            <span className="text-[#4a6b67] text-base font-bold">↔</span>
            <span className="bg-[#2d7d6f]/10 text-[#2d7d6f] text-sm font-bold px-4 py-1.5 rounded-full">
              {bid.skillWanted}
            </span>
            {bid.level && (
              <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                {bid.level}
              </span>
            )}
          </div>

          {/* Description */}
          {bid.description && (
            <p className="text-[#4a6b67] text-sm leading-relaxed mb-5">
              {bid.description}
            </p>
          )}

          {/* Tags */}
          {bid.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {bid.tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Creator info */}
          <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
            <div className="w-11 h-11 rounded-2xl bg-[#2d7d6f] text-white flex items-center justify-center font-bold text-base shrink-0">
              {bid.creator?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#0f2724] text-sm">{bid.creator?.name}</p>
              <p className="text-xs text-[#4a6b67]">{bid.creator?.email}</p>
            </div>
            {reviews.averageRating > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                <Star size={13} className="star-fill" />
                <span className="text-sm font-bold text-amber-700">{reviews.averageRating}</span>
                <span className="text-xs text-amber-600/70">({reviews.total})</span>
              </div>
            )}
          </div>
        </div>

        {/* ── REVIEWS ── */}
        {reviews.reviews?.length > 0 && (
          <div className="fade-up-d2 card-teal p-7 mb-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f2724] flex items-center gap-2">
                <Star size={16} className="star-fill" /> Reviews
              </h3>
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={13}
                    className={s <= Math.round(reviews.averageRating) ? 'star-fill' : 'star-empty'} />
                ))}
                <span className="text-sm font-bold text-[#0f2724] ml-1">{reviews.averageRating}</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-xl bg-[#2d7d6f]/10 text-[#2d7d6f] flex items-center justify-center text-sm font-bold shrink-0">
                    {r.reviewer?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-[#0f2724]">{r.reviewer?.name}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11}
                            className={s <= r.rating ? 'star-fill' : 'star-empty'} />
                        ))}
                      </div>
                      <span className="text-xs text-[#4a6b67] ml-auto">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-[#4a6b67] leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEND REQUEST ── */}
        {!isOwner && (
          <div className="fade-up-d3 card-teal p-7">
            <h3 className="font-bold text-[#0f2724] mb-1 flex items-center gap-2">
              <Send size={16} className="text-[#2d7d6f]" /> Send Exchange Request
            </h3>
            <p className="text-[#4a6b67] text-xs mb-4">
              Introduce yourself and explain why you want this exchange
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-teal w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none transition-all"
              rows={4}
              placeholder="Hi! I can teach you Python and would love to learn UI Design from you. I have 2 years of experience..."
            />

            <button
              onClick={sendRequest}
              disabled={sending}
              className="btn-teal mt-4 w-full bg-[#2d7d6f] text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-teal-200/50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} /> Send Request
                </>
              )}
            </button>
          </div>
        )}

        {/* Owner message */}
        {isOwner && (
          <div className="fade-up-d3 card-teal p-6 text-center border-2 border-dashed border-teal-100">
            <div className="w-12 h-12 bg-[#2d7d6f]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Layers size={22} className="text-[#2d7d6f]" />
            </div>
            <p className="font-bold text-[#0f2724] text-sm">This is your own bid</p>
            <p className="text-[#4a6b67] text-xs mt-1">
              Others can send you exchange requests here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidDetailsPage;