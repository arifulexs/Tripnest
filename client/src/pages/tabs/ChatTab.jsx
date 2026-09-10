import { useEffect, useRef, useState } from "react";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTripSocket } from "../../hooks/useSocket.js";

export default function ChatTab({ trip }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [text, setText] = useState("");
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollForm, setPollForm] = useState({ question: "", options: ["", ""] });
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/trips/${trip._id}/chat`).then((res) => setMessages(res.data.messages));
    api.get(`/trips/${trip._id}/polls`).then((res) => setPolls(res.data.polls));
  }, [trip._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useTripSocket(trip._id, {
    "chat:message": (msg) => setMessages((m) => [...m, msg]),
    "chat:system": (evt) => setMessages((m) => [...m, { _id: Math.random(), type: "system", content: evt.content }]),
    "poll:created": (poll) => setPolls((p) => [poll, ...p]),
    "poll:updated": (poll) => setPolls((p) => p.map((x) => (x._id === poll._id ? poll : x))),
  });

  async function send() {
    if (!text.trim()) return;
    await api.post(`/trips/${trip._id}/chat`, { content: text.trim() });
    setText("");
  }

  async function createPoll() {
    const options = pollForm.options.map((o) => o.trim()).filter(Boolean);
    if (!pollForm.question.trim() || options.length < 2) return;
    await api.post(`/trips/${trip._id}/polls`, { question: pollForm.question, options });
    setPollForm({ question: "", options: ["", ""] });
    setShowPollForm(false);
  }

  async function vote(pollId, optionIndex) {
    await api.post(`/trips/${trip._id}/polls/${pollId}/vote`, { optionIndex });
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr,1fr]">
      <div className="card flex h-[520px] flex-col p-0">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) =>
            m.type === "system" ? (
              <p key={m._id} className="text-center text-xs italic text-inksoft">
                {m.content}
              </p>
            ) : (
              <div key={m._id} className={`flex ${m.user?._id === user.id ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.user?._id === user.id ? "bg-ink text-cream" : "bg-mist/60 text-ink"
                  }`}
                >
                  {m.user?._id !== user.id && (
                    <p className="mb-0.5 text-xs font-semibold" style={{ color: m.user?.avatarColor }}>
                      {m.user?.name}
                    </p>
                  )}
                  {m.content}
                </div>
              </div>
            )
          )}
          {messages.length === 0 && <p className="text-sm text-inksoft">No messages yet — say hi!</p>}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t border-ink/10 p-3">
          <input
            className="input"
            placeholder="Message the trip…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} className="btn-primary shrink-0 text-sm">
            Send
          </button>
        </div>
      </div>

      <div className="card h-fit">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">Polls</h3>
          <button onClick={() => setShowPollForm((s) => !s)} className="text-xs font-medium text-forest hover:underline">
            + New poll
          </button>
        </div>

        {showPollForm && (
          <div className="mt-3 space-y-2 rounded-xl border border-dashed border-ink/20 p-3">
            <input
              className="input"
              placeholder="Where should we eat tonight?"
              value={pollForm.question}
              onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
            />
            {pollForm.options.map((opt, i) => (
              <input
                key={i}
                className="input"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const options = [...pollForm.options];
                  options[i] = e.target.value;
                  setPollForm({ ...pollForm, options });
                }}
              />
            ))}
            <button
              onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ""] })}
              className="text-xs text-forest hover:underline"
            >
              + Add option
            </button>
            <button onClick={createPoll} className="btn-primary w-full text-sm">
              Create poll
            </button>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0);
            const myVoteIdx = poll.options.findIndex((o) => o.votes.includes(user.id));
            const winnerIdx =
              totalVotes > 0
                ? poll.options.reduce((best, o, i, arr) => (o.votes.length > arr[best].votes.length ? i : best), 0)
                : -1;
            return (
              <div key={poll._id} className="rounded-xl bg-mist/30 p-3">
                <p className="text-sm font-medium text-ink">{poll.question}</p>
                <div className="mt-2 space-y-1.5">
                  {poll.options.map((opt, i) => {
                    const pct = totalVotes ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                    return (
                      <button
                        key={i}
                        onClick={() => vote(poll._id, i)}
                        disabled={poll.closed}
                        className="relative w-full overflow-hidden rounded-lg border border-ink/10 bg-paper px-3 py-1.5 text-left text-xs disabled:opacity-70"
                      >
                        <div
                          className={`absolute inset-y-0 left-0 ${i === winnerIdx ? "bg-sun/40" : "bg-sage/20"}`}
                          style={{ width: `${pct}%` }}
                        />
                        <span className="relative flex items-center justify-between">
                          <span className={myVoteIdx === i ? "font-semibold text-ink" : "text-ink"}>{opt.text}</span>
                          <span className="text-inksoft">{pct}%</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {polls.length === 0 && <p className="text-sm text-inksoft">No polls yet.</p>}
        </div>
      </div>
    </div>
  );
}
