/* ─────────────────────────────────────────────────────────────
   FarmerCommunity.jsx  — v2.0
   Real-time farmer community:
     • Firebase Firestore live chat
     • WebRTC peer-to-peer voice calls (via Firestore signaling)
     • Online presence tracking
     • Typing indicators, read receipts, message reactions
     • Borrow request system
───────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, MessageSquare, Phone, Tractor, MapPin,
  Star, Send, ArrowLeft, Users, CheckCheck, Clock,
  Mic, MicOff, PhoneOff, PhoneCall, Video, VideoOff,
  User, Circle, Handshake, ChevronRight, AlertCircle,
  Volume2, VolumeX, Wifi, WifiOff
} from 'lucide-react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, getDoc,
  updateDoc, getDocs, limit, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';

/* ─── helpers ─── */
const fmtTime = d => {
  if (!d) return '';
  const date = d.toDate ? d.toDate() : new Date(d);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

const fmtDuration = s =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ─── WebRTC config (public STUN servers) ─── */
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

/* ─────────────────────────────────────────────────────────────
   WebRTC VOICE CALL PANEL
   Signaling via Firestore:
     /calls/{callId}  → offer, answer, status
     /calls/{callId}/iceCandidates/{side}  → ICE candidates
───────────────────────────────────────────────────────────── */
const CallPanel = ({ currentUser, farmer, onEnd, isIncoming = false, incomingCallId = null }) => {
  const [status, setStatus]       = useState(isIncoming ? 'incoming' : 'ringing');
  const [duration, setDuration]   = useState(0);
  const [callId, setCallId]       = useState(incomingCallId);
  const [muted, setMuted]         = useState(false);
  const [speakerOff, setSpeaker]  = useState(false);
  const [error, setError]         = useState(null);

  const pcRef         = useRef(null);   // RTCPeerConnection
  const localStream   = useRef(null);
  const remoteAudio   = useRef(null);
  const unsubCall     = useRef(null);
  const unsubIce      = useRef(null);

  /* ── helpers ── */
  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      return stream;
    } catch (e) {
      setError('Microphone access denied. Please allow microphone and retry.');
      throw e;
    }
  };

  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    pc.ontrack = e => {
      if (remoteAudio.current) {
        remoteAudio.current.srcObject = e.streams[0];
        if (!speakerOff) remoteAudio.current.play().catch(() => {});
      }
    };
    return pc;
  };

  const sendIceCandidates = (pc, callRef, side) => {
    pc.onicecandidate = async e => {
      if (e.candidate) {
        await addDoc(collection(callRef, 'iceCandidates'), {
          side,
          candidate: e.candidate.toJSON(),
          createdAt: serverTimestamp(),
        });
      }
    };
  };

  /* ── CALLER flow ── */
  const startCall = async () => {
    try {
      const stream = await getMedia();
      const callRef = await addDoc(collection(db, 'calls'), {
        callerId:    currentUser.uid,
        callerName:  currentUser.displayName || userProfile?.name || 'Farmer',
        receiverId:  farmer.uid || farmer.id,
        receiverName: farmer.name,
        status:      'ringing',
        createdAt:   serverTimestamp(),
      });
      setCallId(callRef.id);

      const pc = createPeerConnection(stream);
      sendIceCandidates(pc, callRef, 'caller');

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await updateDoc(callRef, { offer: { type: offer.type, sdp: offer.sdp } });

      /* listen for answer */
      unsubCall.current = onSnapshot(callRef, async snap => {
        const data = snap.data();
        if (!data) return;
        if (data.answer && pc.signalingState !== 'stable') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (_) {}
        }
        if (data.status === 'active')   setStatus('active');
        if (data.status === 'rejected') { setStatus('rejected'); setTimeout(endCall, 1800); }
        if (data.status === 'ended')    { setStatus('ended');    setTimeout(endCall, 1500); }
      });

      /* listen for receiver ICE */
      unsubIce.current = onSnapshot(
        query(collection(callRef, 'iceCandidates'), where('side', '==', 'receiver')),
        snap => {
          snap.docChanges().forEach(change => {
            if (change.type === 'added') {
              pc.addIceCandidate(new RTCIceCandidate(change.doc.data().candidate)).catch(() => {});
            }
          });
        }
      );
    } catch (e) { console.error(e); }
  };

  /* ── RECEIVER flow ── */
  const answerCall = async () => {
    if (!callId) return;
    const callRef = doc(db, 'calls', callId);
    try {
      const callSnap = await getDoc(callRef);
      const data = callSnap.data();

      const stream = await getMedia();
      const pc = createPeerConnection(stream);
      sendIceCandidates(pc, callRef, 'receiver');

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await updateDoc(callRef, {
        answer: { type: answer.type, sdp: answer.sdp },
        status: 'active',
      });
      setStatus('active');

      /* listen for caller ICE */
      unsubIce.current = onSnapshot(
        query(collection(callRef, 'iceCandidates'), where('side', '==', 'caller')),
        snap => {
          snap.docChanges().forEach(change => {
            if (change.type === 'added') {
              pc.addIceCandidate(new RTCIceCandidate(change.doc.data().candidate)).catch(() => {});
            }
          });
        }
      );

      unsubCall.current = onSnapshot(callRef, snap => {
        const s = snap.data()?.status;
        if (s === 'ended') { setStatus('ended'); setTimeout(endCall, 1500); }
      });
    } catch (e) { console.error(e); setError('Could not connect. Please retry.'); }
  };

  const rejectIncoming = async () => {
    if (callId) await updateDoc(doc(db, 'calls', callId), { status: 'rejected' });
    onEnd();
  };

  /* ── end / cleanup ── */
  const endCall = useCallback(async () => {
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStream.current) { localStream.current.getTracks().forEach(t => t.stop()); localStream.current = null; }
    if (unsubCall.current) { unsubCall.current(); unsubCall.current = null; }
    if (unsubIce.current)  { unsubIce.current();  unsubIce.current  = null; }
    if (callId) {
      try { await updateDoc(doc(db, 'calls', callId), { status: 'ended' }); } catch (_) {}
    }
    onEnd();
  }, [callId, onEnd]);

  useEffect(() => {
    if (!isIncoming) startCall();
    return () => {
      if (pcRef.current) pcRef.current.close();
      if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
      if (unsubCall.current) unsubCall.current();
      if (unsubIce.current) unsubIce.current();
    };
  }, []);

  useEffect(() => {
    if (status !== 'active') return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(t => { t.enabled = muted; });
      setMuted(m => !m);
    }
  };

  const toggleSpeaker = () => {
    if (remoteAudio.current) {
      remoteAudio.current.volume = speakerOff ? 1 : 0;
    }
    setSpeaker(s => !s);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="call-panel"
    >
      <audio ref={remoteAudio} autoPlay playsInline style={{ display: 'none' }} />
      <div className="call-bg" />
      <div className="call-inner">
        {/* Pulse ring when ringing */}
        {(status === 'ringing' || status === 'incoming') && (
          <div className="call-ring-wrap">
            <div className="call-ring call-ring--1" />
            <div className="call-ring call-ring--2" />
          </div>
        )}

        <div className="call-avatar">{farmer.name?.charAt(0)?.toUpperCase()}</div>
        <p className="call-name">{farmer.name}</p>
        <p className="call-village"><MapPin size={12} /> {farmer.village}</p>

        {error ? (
          <p className="call-error"><AlertCircle size={13} /> {error}</p>
        ) : (
          <p className="call-status">
            {status === 'ringing'  ? <><span className="call-status-dot" /> Calling…</>         : null}
            {status === 'incoming' ? <><span className="call-status-dot" /> Incoming call…</>    : null}
            {status === 'active'   ? <><Wifi size={13} /> {fmtDuration(duration)}</>             : null}
            {status === 'rejected' ? 'Call Rejected'                                             : null}
            {status === 'ended'    ? 'Call Ended'                                               : null}
          </p>
        )}

        {status === 'active' && (
          <p className="call-quality">🔒 Encrypted WebRTC · In-App Audio</p>
        )}

        {/* INCOMING — accept / reject */}
        {status === 'incoming' ? (
          <div className="call-actions">
            <div className="call-action-group">
              <button className="call-btn call-btn--accept" onClick={answerCall}>
                <PhoneCall size={22} />
              </button>
              <p className="call-btn-label">Accept</p>
            </div>
            <div className="call-action-group">
              <button className="call-btn call-btn--end" onClick={rejectIncoming}>
                <PhoneOff size={22} />
              </button>
              <p className="call-btn-label">Decline</p>
            </div>
          </div>
        ) : (
          /* ACTIVE / RINGING — controls */
          <div className="call-actions">
            <div className="call-action-group">
              <button className={`call-btn ${muted ? 'call-btn--active-ico' : 'call-btn--ico'}`} onClick={toggleMute}>
                {muted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <p className="call-btn-label">{muted ? 'Unmute' : 'Mute'}</p>
            </div>
            <div className="call-action-group">
              <button className="call-btn call-btn--end" onClick={endCall}>
                <PhoneOff size={22} />
              </button>
              <p className="call-btn-label">End</p>
            </div>
            <div className="call-action-group">
              <button className={`call-btn ${speakerOff ? 'call-btn--active-ico' : 'call-btn--ico'}`} onClick={toggleSpeaker}>
                {speakerOff ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <p className="call-btn-label">{speakerOff ? 'Speaker' : 'Speaker'}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   LIVE CHAT VIEW
───────────────────────────────────────────────────────────── */
const LiveChat = ({ currentUser, farmer, onBack, onCall }) => {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [typing,   setTyping]   = useState(false);
  const [online,   setOnline]   = useState(false);

  const chatId       = getChatId(currentUser.uid, farmer.uid || farmer.id.toString());
  const endRef       = useRef(null);
  const typingTimer  = useRef(null);
  const inputRef     = useRef(null);

  /* ── messages ── */
  useEffect(() => {
    const msgsRef = collection(db, 'farmer_chats', chatId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(100));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      /* mark received messages as read */
      snap.docs.forEach(d => {
        if (d.data().senderId !== currentUser.uid && !d.data().read) {
          updateDoc(d.ref, { read: true }).catch(() => {});
        }
      });
    });
    return unsub;
  }, [chatId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ── typing indicator ── */
  useEffect(() => {
    const typingRef = doc(db, 'farmer_chats', chatId, 'typing', farmer.uid || farmer.id.toString());
    const unsub = onSnapshot(typingRef, snap => {
      if (snap.exists()) setTyping(snap.data().isTyping);
      else setTyping(false);
    });
    return unsub;
  }, [chatId]);

  /* ── online presence ── */
  useEffect(() => {
    const presenceRef = doc(db, 'presence', farmer.uid || farmer.id.toString());
    const unsub = onSnapshot(presenceRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
        const isOnline = (Date.now() - lastSeen.getTime()) < 90_000; // within 90s
        setOnline(data.online === true || isOnline);
      }
    });
    /* set own presence */
    const myPresence = doc(db, 'presence', currentUser.uid);
    setDoc(myPresence, { online: true, lastSeen: serverTimestamp() }, { merge: true });
    const interval = setInterval(() => {
      setDoc(myPresence, { online: true, lastSeen: serverTimestamp() }, { merge: true });
    }, 30_000);
    return () => { unsub(); clearInterval(interval); setDoc(myPresence, { online: false, lastSeen: serverTimestamp() }, { merge: true }); };
  }, []);

  const updateTyping = async (isTyping) => {
    const typingRef = doc(db, 'farmer_chats', chatId, 'typing', currentUser.uid);
    await setDoc(typingRef, { uid: currentUser.uid, isTyping }, { merge: true });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    updateTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => updateTyping(false), 1500);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    updateTyping(false);
    setSending(true);
    try {
      const msgsRef = collection(db, 'farmer_chats', chatId, 'messages');
      await addDoc(msgsRef, {
        text,
        senderId:   currentUser.uid,
        senderName: currentUser.displayName || 'Farmer',
        createdAt:  serverTimestamp(),
        read:       false,
      });
      await setDoc(doc(db, 'farmer_chats', chatId), {
        participants:  [currentUser.uid, farmer.uid || farmer.id.toString()],
        lastMessage:   text,
        lastAt:        serverTimestamp(),
        farmerName:    farmer.name,
        farmerVillage: farmer.village,
      }, { merge: true });
    } catch (err) { console.error('Send failed:', err); }
    finally { setSending(false); inputRef.current?.focus(); }
  };

  /* group messages by date */
  const grouped = useMemo(() => {
    const groups = [];
    let lastDate = null;
    messages.forEach(msg => {
      const d = msg.createdAt?.toDate?.() || new Date();
      const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (dateStr !== lastDate) { groups.push({ type: 'date', label: dateStr }); lastDate = dateStr; }
      groups.push({ type: 'msg', ...msg });
    });
    return groups;
  }, [messages]);

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="chat-back" onClick={onBack}><ArrowLeft size={17} /></button>
        <div className="chat-header-av">
          {farmer.name?.charAt(0)}
          <span className={`chat-presence-dot ${online ? 'chat-presence-dot--on' : ''}`} />
        </div>
        <div style={{ flex: 1 }}>
          <p className="chat-header-name">{farmer.name}</p>
          <p className="chat-header-sub">
            {typing
              ? <span className="chat-typing-label">typing…</span>
              : online
                ? <span className="chat-online-label">● Online</span>
                : <><MapPin size={10} style={{ display: 'inline' }} /> {farmer.village}</>}
          </p>
        </div>
        <button className="chat-call-btn" onClick={onCall} title="Voice Call">
          <Phone size={17} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <MessageSquare size={28} style={{ color: 'var(--green-mid)', margin: '0 auto 10px', display: 'block' }} />
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 4 }}>Say hello!</p>
            <p style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500 }}>Start your first conversation with {farmer.name}</p>
          </div>
        )}

        {grouped.map((item, idx) => {
          if (item.type === 'date') return (
            <div key={`date-${idx}`} className="chat-date-divider">
              <span>{item.label}</span>
            </div>
          );
          const mine = item.senderId === currentUser.uid;
          return (
            <div key={item.id} className={`chat-msg ${mine ? 'chat-msg--me' : 'chat-msg--them'}`}>
              {!mine && <div className="chat-msg-av">{farmer.name?.charAt(0)}</div>}
              <div className={`chat-bubble ${mine ? 'chat-bubble--me' : 'chat-bubble--them'}`}>
                <p className="chat-bubble-text">{item.text}</p>
                <div className="chat-bubble-meta">
                  <span className="chat-bubble-time">{fmtTime(item.createdAt)}</span>
                  {mine && (
                    <span className="chat-read-icon">
                      {item.read ? <CheckCheck size={12} style={{ color: '#7dd9a3' }} /> : <CheckCheck size={12} style={{ opacity: 0.4 }} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="chat-msg chat-msg--them">
            <div className="chat-msg-av">{farmer.name?.charAt(0)}</div>
            <div className="chat-typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form className="chat-input-row" onSubmit={sendMessage}>
        <input
          ref={inputRef}
          className="chat-input"
          placeholder={`Message ${farmer.name}…`}
          value={input}
          onChange={handleInputChange}
          autoFocus
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-send"
          disabled={!input.trim() || sending}
          style={{ opacity: (!input.trim() || sending) ? 0.45 : 1 }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   BORROW REQUEST VIEW
───────────────────────────────────────────────────────────── */
const BorrowView = ({ currentUser, farmer, onBack }) => {
  const [selected,   setSelected]   = useState([]);
  const [message,    setMessage]    = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [days,       setDays]       = useState('1');
  const [sent,       setSent]       = useState(false);
  const [sending,    setSending]    = useState(false);

  const toggle = inst =>
    setSelected(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);

  const sendRequest = async () => {
    if (!selected.length || !dateNeeded) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'borrow_requests'), {
        fromUid:     currentUser.uid,
        fromName:    currentUser.displayName || 'Farmer',
        toUid:       farmer.uid || farmer.id.toString(),
        toName:      farmer.name,
        instruments: selected,
        message:     message.trim(),
        dateNeeded,
        days:        parseInt(days),
        status:      'pending',
        createdAt:   serverTimestamp(),
      });
      setSent(true);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  if (sent) return (
    <div className="borrow-success">
      <div className="borrow-success-ico">✓</div>
      <p className="borrow-success-title">Request Sent!</p>
      <p className="borrow-success-sub">{farmer.name} will be notified. You'll get a reply soon.</p>
      <button className="borrow-back-btn" onClick={onBack}>← Back to Farmer</button>
    </div>
  );

  return (
    <div className="borrow-view">
      <button className="chat-back" onClick={onBack} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> Back
      </button>
      <p className="fc-section-label" style={{ marginBottom: 10 }}>Select Instruments to Borrow</p>
      <div className="borrow-instruments">
        {farmer.instruments.map((inst, i) => (
          <button
            key={i}
            className={`borrow-inst-btn ${selected.includes(inst) ? 'borrow-inst-btn--on' : ''}`}
            onClick={() => toggle(inst)}
          >
            <Tractor size={13} /> {inst}
          </button>
        ))}
      </div>
      <p className="fc-section-label" style={{ marginTop: 16, marginBottom: 8 }}>When do you need it?</p>
      <div className="borrow-date-row">
        <div style={{ flex: 1 }}>
          <p className="fc-field-label">Date</p>
          <input type="date" className="fc-input" value={dateNeeded} onChange={e => setDateNeeded(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        </div>
        <div style={{ width: 100 }}>
          <p className="fc-field-label">Days</p>
          <select className="fc-input" value={days} onChange={e => setDays(e.target.value)}>
            {[1,2,3,5,7,10].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      </div>
      <p className="fc-section-label" style={{ marginTop: 14, marginBottom: 8 }}>Message (optional)</p>
      <textarea
        className="fc-textarea"
        placeholder="Describe your requirement…"
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={3}
      />
      <button
        className="borrow-submit-btn"
        onClick={sendRequest}
        disabled={!selected.length || !dateNeeded || sending}
      >
        <Handshake size={16} />
        {sending ? 'Sending…' : 'Send Borrow Request'}
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   FARMER DETAIL VIEW
───────────────────────────────────────────────────────────── */
const FarmerDetail = ({ currentUser, farmer, onBack, onChat, onCall, onBorrow }) => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const ref = doc(db, 'presence', farmer.uid || farmer.id.toString());
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data();
        const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
        setOnline(data.online === true || (Date.now() - lastSeen.getTime()) < 90_000);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="fc-detail">
      <button className="chat-back" onClick={onBack} style={{ marginBottom: 8 }}><ArrowLeft size={17} /></button>
      <div className="fc-detail-hero">
        <div style={{ position: 'relative', width: 72, margin: '0 auto 12px' }}>
          <div className="fc-detail-av">{farmer.name?.charAt(0)}</div>
          {online && <span className="fc-detail-online" />}
        </div>
        <h2 className="fc-detail-name">{farmer.name}</h2>
        <p className="fc-detail-village"><MapPin size={13} /> {farmer.village} · {farmer.distance}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 8 }}>
          <span className="fc-rating"><Star size={13} fill="currentColor" /> {farmer.rating}</span>
          <span className={`fc-avail ${farmer.available ? 'fc-avail--on' : 'fc-avail--off'}`}>
            {farmer.available ? 'Available' : 'Busy'}
          </span>
          {online && <span className="fc-avail fc-avail--on" style={{ background: 'var(--green-bg)' }}>🟢 Online</span>}
        </div>
      </div>

      <div className="fc-detail-section">
        <p className="fc-section-label">Available Instruments</p>
        <div className="fc-instruments">
          {farmer.instruments.length ? farmer.instruments.map((inst, i) => (
            <span key={i} className="fc-inst-pill"><Tractor size={11} /> {inst}</span>
          )) : <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>None listed</span>}
        </div>
      </div>

      <div className="fc-detail-section">
        <p className="fc-section-label">Grows</p>
        <div className="fc-instruments">
          {farmer.crops.length ? farmer.crops.map((c, i) => (
            <span key={i} className="fc-crop-pill">{c}</span>
          )) : <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Not specified</span>}
        </div>
      </div>

      <div className="fc-action-grid">
        <button className="fc-action-btn fc-action-btn--primary" onClick={onChat}>
          <MessageSquare size={16} /> Live Chat
        </button>
        <button className="fc-action-btn fc-action-btn--call" onClick={onCall}>
          <Phone size={16} /> Voice Call
        </button>
        <button className="fc-action-btn fc-action-btn--borrow" onClick={onBorrow} style={{ gridColumn: 'span 2' }}>
          <Tractor size={16} /> Request to Borrow
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   INCOMING CALL TOAST  (shown on list/detail/chat screens)
───────────────────────────────────────────────────────────── */
const IncomingCallToast = ({ callData, onAnswer, onDecline }) => (
  <motion.div
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -80, opacity: 0 }}
    className="incoming-toast"
  >
    <div className="incoming-toast-av">{callData.callerName?.charAt(0)}</div>
    <div style={{ flex: 1 }}>
      <p className="incoming-toast-name">{callData.callerName}</p>
      <p className="incoming-toast-sub">Incoming voice call…</p>
    </div>
    <button className="incoming-toast-btn incoming-toast-btn--decline" onClick={onDecline}>
      <PhoneOff size={18} />
    </button>
    <button className="incoming-toast-btn incoming-toast-btn--accept" onClick={onAnswer}>
      <PhoneCall size={18} />
    </button>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN FARMER COMMUNITY COMPONENT
───────────────────────────────────────────────────────────── */
const FarmerCommunity = ({ currentUser, userProfile, onClose, nearbyFarmers = [] }) => {
  const [view,         setView]        = useState('list');
  const [search,       setSearch]      = useState('');
  const [selected,     setSelected]    = useState(null);
  const [farmers,      setFarmers]     = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [incomingCall, setIncomingCall] = useState(null); // { id, callerName, callerId, ... }

  /* ── load farmers ── */
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, snap => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => (u.uid || u.id) !== currentUser?.uid)
        .map(u => ({
          ...u,
          name:        u.displayName || u.name || 'Anonymous Farmer',
          village:     u.village     || 'Unknown Location',
          crops:       u.crops       || [],
          instruments: u.instruments || [],
          rating:      u.rating      || 5.0,
          distance:    u.distance    || 'Near you',
          available:   u.available !== undefined ? u.available : true,
          phone:       u.phone       || '',
        }));
      setFarmers(list);
      setLoading(false);
    });
    return unsub;
  }, [currentUser.uid]);

  /* ── own presence heartbeat ── */
  useEffect(() => {
    const presenceRef = doc(db, 'presence', currentUser.uid);
    const set = () => setDoc(presenceRef, { online: true, lastSeen: serverTimestamp(), uid: currentUser.uid }, { merge: true });
    set();
    const interval = setInterval(set, 30_000);
    return () => {
      clearInterval(interval);
      setDoc(presenceRef, { online: false, lastSeen: serverTimestamp() }, { merge: true });
    };
  }, [currentUser.uid]);

  /* ── incoming call listener ── */
  useEffect(() => {
    const q = query(
      collection(db, 'calls'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'ringing')
    );
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const d = snap.docs[0];
        setIncomingCall({ id: d.id, ...d.data() });
      } else {
        setIncomingCall(null);
      }
    });
    return unsub;
  }, [currentUser.uid]);

  const handleAnswerIncoming = () => {
    /* find or create a placeholder farmer object from the call data */
    const callerFarmer = farmers.find(f => (f.uid || f.id) === incomingCall?.callerId) || {
      name: incomingCall?.callerName || 'Farmer',
      village: '',
      uid: incomingCall?.callerId,
    };
    setSelected(callerFarmer);
    setView('call-incoming');
    setIncomingCall(null);
  };

  const handleDeclineIncoming = async () => {
    if (incomingCall?.id) {
      await updateDoc(doc(db, 'calls', incomingCall.id), { status: 'rejected' });
    }
    setIncomingCall(null);
  };

  const filtered = useMemo(() => farmers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.village.toLowerCase().includes(search.toLowerCase()) ||
    f.instruments.some(i => i.toLowerCase().includes(search.toLowerCase())) ||
    f.crops.some(c => c.toLowerCase().includes(search.toLowerCase()))
  ), [farmers, search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');
        .fc-root *{box-sizing:border-box;font-family:'Nunito',sans-serif}
        :root{
          --bg:#f0f4ed;--surface:#fff;--surface-2:#f7f9f6;
          --border:#e2e8df;--border-2:#d4dcd0;
          --ink:#1a2117;--ink-2:#3a4a37;--ink-3:#7a8c77;--ink-4:#b0bcad;
          --green:#2e7d4f;--green-2:#3fa066;--green-bg:#eaf4ee;--green-mid:#a8d4b5;
          --amber:#b8651a;--amber-bg:#fef3e7;
          --rose:#c0392b;--rose-bg:#fdecea;
          --sky:#1e6ea6;--sky-bg:#e8f3fb;
          --sh-1:0 1px 4px rgba(20,35,18,.07);
          --sh-2:0 4px 20px rgba(20,35,18,.09),0 1px 4px rgba(20,35,18,.05);
          --sh-3:0 16px 56px rgba(20,35,18,.13),0 4px 14px rgba(20,35,18,.06);
          --sh-4:0 32px 80px rgba(20,35,18,.18),0 8px 24px rgba(20,35,18,.08);
          --r-sm:10px;--r-md:14px;--r-lg:20px;--r-xl:28px;
        }

        /* OVERLAY */
        .fc-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,35,18,.45);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
        .fc-panel{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);width:100%;max-width:500px;height:85vh;display:flex;flex-direction:column;box-shadow:var(--sh-4);overflow:hidden}
        .fc-bar{height:3px;background:linear-gradient(90deg,var(--green),var(--green-2),#7dd9a3);flex-shrink:0}
        .fc-panel-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);flex-shrink:0}
        .fc-panel-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:800;color:var(--ink)}
        .fc-panel-sub{font-size:11.5px;color:var(--ink-3);font-weight:500;margin-top:2px}
        .fc-close{width:34px;height:34px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;cursor:pointer;color:var(--ink-3);display:flex;align-items:center;justify-content:center}
        .fc-close:hover{background:var(--border);color:var(--ink)}
        .fc-search-wrap{padding:14px 20px;border-bottom:1px solid var(--border);flex-shrink:0}
        .fc-search{position:relative}
        .fc-search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink-4)}
        .fc-search-inp{width:100%;background:var(--surface-2);border:1px solid var(--border);border-radius:100px;padding:9px 14px 9px 36px;font-size:13px;font-family:'Nunito',sans-serif;font-weight:600;color:var(--ink);outline:none}
        .fc-search-inp:focus{border-color:var(--green-mid);box-shadow:0 0 0 3px rgba(168,212,181,.2)}
        .fc-list{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
        .fc-list::-webkit-scrollbar{display:none}

        /* FARMER CARD */
        .fc-farmer-card{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 16px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:12px}
        .fc-farmer-card:hover{border-color:var(--green-mid);box-shadow:var(--sh-1);background:var(--surface)}
        .fc-farmer-av-wrap{position:relative;flex-shrink:0}
        .fc-farmer-av{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green-bg),var(--green-mid));display:flex;align-items:center;justify-content:center;color:var(--green);font-size:18px;font-weight:800}
        .fc-av-online{position:absolute;bottom:1px;right:1px;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid var(--surface-2)}
        .fc-farmer-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:2px}
        .fc-farmer-loc{font-size:11.5px;color:var(--ink-3);font-weight:500;display:flex;align-items:center;gap:4px;margin-bottom:6px}
        .fc-farmer-pills{display:flex;flex-wrap:wrap;gap:5px}
        .fc-inst-pill{font-size:10px;font-weight:700;color:var(--green);background:var(--green-bg);border:1px solid rgba(46,125,79,.15);padding:3px 9px;border-radius:100px;display:flex;align-items:center;gap:4px}
        .fc-crop-pill{font-size:10px;font-weight:700;color:var(--sky);background:var(--sky-bg);border:1px solid rgba(30,110,166,.15);padding:3px 9px;border-radius:100px}
        .fc-farmer-right{margin-left:auto;flex-shrink:0;text-align:right}
        .fc-rating{font-size:12px;font-weight:700;color:var(--amber);display:flex;align-items:center;gap:3px;justify-content:flex-end}
        .fc-dist{font-size:11px;color:var(--ink-4);font-weight:600;margin-top:3px}
        .fc-avail{font-size:10px;font-weight:800;padding:2px 9px;border-radius:100px;margin-top:5px;display:inline-block}
        .fc-avail--on{color:var(--green);background:var(--green-bg);border:1px solid var(--green-mid)}
        .fc-avail--off{color:var(--ink-4);background:var(--surface-2);border:1px solid var(--border)}
        .fc-quick-btns{display:flex;gap:6px;margin-top:10px}
        .fc-quick-chat{display:flex;align-items:center;gap:5px;padding:6px 12px;background:var(--green);color:#fff;border:none;border-radius:8px;font-size:11.5px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;transition:all .15s}
        .fc-quick-chat:hover{filter:brightness(1.08)}
        .fc-quick-call{display:flex;align-items:center;gap:5px;padding:6px 12px;background:var(--sky-bg);color:var(--sky);border:1px solid rgba(30,110,166,.2);border-radius:8px;font-size:11.5px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;transition:all .15s}
        .fc-quick-call:hover{background:var(--sky);color:#fff}
        .fc-quick-borrow{display:flex;align-items:center;gap:5px;padding:6px 12px;background:var(--amber-bg);color:var(--amber);border:1px solid rgba(184,101,26,.2);border-radius:8px;font-size:11.5px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;transition:all .15s}
        .fc-quick-borrow:hover{background:var(--amber);color:#fff}

        /* DETAIL VIEW */
        .fc-detail{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:14px}
        .fc-detail::-webkit-scrollbar{display:none}
        .fc-detail-hero{text-align:center;padding:10px 0}
        .fc-detail-av{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--green-bg),var(--green-mid));display:flex;align-items:center;justify-content:center;color:var(--green);font-size:28px;font-weight:800}
        .fc-detail-online{position:absolute;bottom:3px;right:3px;width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid var(--surface)}
        .fc-detail-name{font-family:'Playfair Display',serif;font-size:24px;font-weight:800;color:var(--ink);margin-bottom:5px}
        .fc-detail-village{font-size:12px;color:var(--ink-3);font-weight:500;display:flex;align-items:center;gap:5px;justify-content:center}
        .fc-detail-section{background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:14px 16px}
        .fc-section-label{font-size:10.5px;font-weight:800;color:var(--ink-4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}
        .fc-instruments{display:flex;flex-wrap:wrap;gap:7px}
        .fc-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .fc-action-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border:none;border-radius:12px;font-size:13.5px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;transition:all .15s}
        .fc-action-btn--primary{background:linear-gradient(135deg,#1a4a2e,var(--green-2));color:#fff;box-shadow:0 3px 10px rgba(46,125,79,.22)}
        .fc-action-btn--primary:hover{filter:brightness(1.08)}
        .fc-action-btn--call{background:var(--sky-bg);color:var(--sky);border:1px solid rgba(30,110,166,.2)}
        .fc-action-btn--call:hover{background:var(--sky);color:#fff}
        .fc-action-btn--borrow{background:var(--amber-bg);color:var(--amber);border:1px solid rgba(184,101,26,.2)}
        .fc-action-btn--borrow:hover{background:var(--amber);color:#fff}

        /* CHAT */
        .chat-view{flex:1;display:flex;flex-direction:column;min-height:0}
        .chat-header{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--surface)}
        .chat-back{width:32px;height:32px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink-3);flex-shrink:0}
        .chat-back:hover{background:var(--border)}
        .chat-header-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--green-bg),var(--green-mid));display:flex;align-items:center;justify-content:center;color:var(--green);font-size:14px;font-weight:800;flex-shrink:0;position:relative}
        .chat-presence-dot{position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:var(--ink-4);border:2px solid var(--surface)}
        .chat-presence-dot--on{background:#22c55e}
        .chat-header-name{font-size:14px;font-weight:700;color:var(--ink)}
        .chat-header-sub{font-size:11px;color:var(--ink-3);font-weight:500;display:flex;align-items:center;gap:4px;margin-top:1px}
        .chat-typing-label{color:var(--green);font-style:italic}
        .chat-online-label{color:#22c55e;font-weight:700}
        .chat-call-btn{width:34px;height:34px;border-radius:50%;background:var(--sky-bg);border:1px solid rgba(30,110,166,.2);color:var(--sky);display:flex;align-items:center;justify-content:center;cursor:pointer;margin-left:auto;flex-shrink:0;transition:all .15s}
        .chat-call-btn:hover{background:var(--sky);color:#fff}
        .chat-messages{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;background:var(--bg)}
        .chat-messages::-webkit-scrollbar{display:none}
        .chat-empty{text-align:center;padding:40px 20px}
        .chat-date-divider{display:flex;align-items:center;gap:10px;padding:4px 0;color:var(--ink-4);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
        .chat-date-divider::before,.chat-date-divider::after{content:'';flex:1;height:1px;background:var(--border)}
        .chat-msg{display:flex;align-items:flex-end;gap:8px;max-width:82%}
        .chat-msg--me{align-self:flex-end;flex-direction:row-reverse}
        .chat-msg--them{align-self:flex-start}
        .chat-msg-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--green-bg),var(--green-mid));display:flex;align-items:center;justify-content:center;color:var(--green);font-size:11px;font-weight:800;flex-shrink:0}
        .chat-bubble{padding:10px 14px;border-radius:16px;max-width:260px}
        .chat-bubble--me{background:linear-gradient(135deg,#1a4a2e,#1e5035);color:#fff;border-bottom-right-radius:4px}
        .chat-bubble--them{background:var(--surface);border:1px solid var(--border);color:var(--ink-2);border-bottom-left-radius:4px;box-shadow:var(--sh-1)}
        .chat-bubble-text{font-size:13.5px;line-height:1.5;font-weight:500}
        .chat-bubble-meta{display:flex;align-items:center;gap:4px;margin-top:4px;justify-content:flex-end}
        .chat-bubble-time{font-size:10px;color:rgba(255,255,255,.5)}
        .chat-bubble--them .chat-bubble-time{color:var(--ink-4)}
        .chat-read-icon{display:flex;align-items:center}
        .chat-typing-indicator{display:flex;gap:4px;align-items:center;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:16px;border-bottom-left-radius:4px}
        .chat-typing-indicator span{width:7px;height:7px;border-radius:50%;background:var(--green-mid);animation:bounce .9s ease-in-out infinite}
        .chat-typing-indicator span:nth-child(2){animation-delay:.2s}
        .chat-typing-indicator span:nth-child(3){animation-delay:.4s}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        .chat-input-row{display:flex;gap:8px;padding:12px 16px 20px;border-top:1px solid var(--border);background:var(--surface);flex-shrink:0}
        .chat-input{flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:100px;padding:10px 16px;font-size:13px;font-family:'Nunito',sans-serif;font-weight:600;color:var(--ink);outline:none}
        .chat-input:focus{border-color:var(--green-mid);box-shadow:0 0 0 3px rgba(168,212,181,.2)}
        .chat-send{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#1a4a2e,var(--green-2));color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(46,125,79,.25);transition:all .15s}
        .chat-send:hover{filter:brightness(1.1)}
        .chat-send:disabled{cursor:not-allowed}

        /* BORROW VIEW */
        .borrow-view{flex:1;overflow-y:auto;padding:18px 20px}
        .borrow-view::-webkit-scrollbar{display:none}
        .borrow-instruments{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px}
        .borrow-inst-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:100px;font-size:12.5px;font-weight:700;color:var(--ink-2);cursor:pointer;transition:all .15s;font-family:'Nunito',sans-serif}
        .borrow-inst-btn--on{background:var(--green-bg);color:var(--green);border-color:var(--green-mid)}
        .borrow-inst-btn:hover:not(.borrow-inst-btn--on){border-color:var(--green-mid)}
        .borrow-date-row{display:flex;gap:12px}
        .fc-input{width:100%;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px;font-family:'Nunito',sans-serif;font-weight:600;color:var(--ink);outline:none}
        .fc-input:focus{border-color:var(--green-mid)}
        .fc-field-label{font-size:11px;font-weight:700;color:var(--ink-3);margin-bottom:5px}
        .fc-textarea{width:100%;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px;font-family:'Nunito',sans-serif;font-weight:500;color:var(--ink);outline:none;resize:vertical;min-height:72px}
        .fc-textarea:focus{border-color:var(--green-mid)}
        .borrow-submit-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:16px;padding:13px;background:linear-gradient(135deg,#1a4a2e,var(--green-2));color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;box-shadow:0 3px 10px rgba(46,125,79,.22)}
        .borrow-submit-btn:hover{filter:brightness(1.08)}
        .borrow-submit-btn:disabled{opacity:.4;cursor:not-allowed}
        .borrow-success{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px 24px;gap:12px}
        .borrow-success-ico{width:64px;height:64px;border-radius:50%;background:var(--green-bg);border:2px solid var(--green-mid);display:flex;align-items:center;justify-content:center;font-size:28px;color:var(--green)}
        .borrow-success-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:var(--ink)}
        .borrow-success-sub{font-size:13px;color:var(--ink-3);font-weight:500;line-height:1.5;max-width:260px}
        .borrow-back-btn{padding:11px 24px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;color:var(--ink-2);margin-top:8px}
        .borrow-back-btn:hover{background:var(--border)}

        /* CALL PANEL */
        .call-panel{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;border-radius:var(--r-xl);overflow:hidden}
        .call-bg{position:absolute;inset:0;background:linear-gradient(145deg,#0a1a10,#152b1e,#0d2218)}
        .call-inner{position:relative;z-index:1;text-align:center;padding:40px 24px;width:100%}
        .call-ring-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
        .call-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(125,217,163,.3);animation:ring-expand 2s ease-out infinite}
        .call-ring--1{width:140px;height:140px}
        .call-ring--2{width:200px;height:200px;animation-delay:.7s}
        @keyframes ring-expand{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.4);opacity:0}}
        .call-avatar{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.1);border:3px solid rgba(125,217,163,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:36px;font-weight:800;margin:0 auto 16px;position:relative;z-index:1}
        .call-name{font-family:'Playfair Display',serif;font-size:26px;font-weight:800;color:#fff;margin-bottom:6px}
        .call-village{font-size:12px;color:rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;gap:5px;margin-bottom:20px}
        .call-status{font-size:14px;color:#7dd9a3;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:6px}
        .call-status-dot{width:8px;height:8px;border-radius:50%;background:#7dd9a3;animation:pulse-dot 1.4s ease-in-out infinite}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.3)}}
        .call-quality{font-size:11px;color:rgba(255,255,255,.3);margin-bottom:36px;letter-spacing:.03em}
        .call-error{font-size:12px;color:#f5a09a;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:28px;background:rgba(192,57,43,.15);padding:8px 16px;border-radius:8px;border:1px solid rgba(192,57,43,.25)}
        .call-actions{display:flex;justify-content:center;align-items:flex-start;gap:28px;margin-top:8px}
        .call-action-group{display:flex;flex-direction:column;align-items:center;gap:8px}
        .call-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .call-btn--ico{background:rgba(255,255,255,.12);color:#fff}
        .call-btn--ico:hover{background:rgba(255,255,255,.22)}
        .call-btn--active-ico{background:rgba(255,100,100,.25);color:#f5a09a}
        .call-btn--end{background:#c0392b;color:#fff;width:64px;height:64px;box-shadow:0 4px 18px rgba(192,57,43,.45)}
        .call-btn--end:hover{background:#a93226;transform:scale(1.05)}
        .call-btn--accept{background:#22c55e;color:#fff;width:64px;height:64px;box-shadow:0 4px 18px rgba(34,197,94,.45)}
        .call-btn--accept:hover{background:#16a34a;transform:scale(1.05)}
        .call-btn-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.04em}

        /* INCOMING CALL TOAST */
        .incoming-toast{position:absolute;top:12px;left:12px;right:12px;z-index:20;background:#fff;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:var(--sh-3);border:1.5px solid var(--green-mid)}
        .incoming-toast-av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--green-bg),var(--green-mid));display:flex;align-items:center;justify-content:center;color:var(--green);font-size:16px;font-weight:800;flex-shrink:0}
        .incoming-toast-name{font-size:13.5px;font-weight:800;color:var(--ink)}
        .incoming-toast-sub{font-size:11px;color:var(--green);font-weight:600;margin-top:2px}
        .incoming-toast-btn{width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
        .incoming-toast-btn--decline{background:#fdecea;color:#c0392b}
        .incoming-toast-btn--decline:hover{background:#c0392b;color:#fff}
        .incoming-toast-btn--accept{background:#d1fae5;color:#16a34a}
        .incoming-toast-btn--accept:hover{background:#22c55e;color:#fff}
      `}</style>

      <div className="fc-root fc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fc-panel"
        >
          <div className="fc-bar" />

          {/* Incoming call toast (shown over other views) */}
          <AnimatePresence>
            {incomingCall && view !== 'call' && view !== 'call-incoming' && (
              <IncomingCallToast
                callData={incomingCall}
                onAnswer={handleAnswerIncoming}
                onDecline={handleDeclineIncoming}
              />
            )}
          </AnimatePresence>

          {/* OUTGOING CALL */}
          <AnimatePresence>
            {view === 'call' && selected && (
              <CallPanel
                currentUser={currentUser}
                farmer={selected}
                isIncoming={false}
                onEnd={() => setView('detail')}
              />
            )}
          </AnimatePresence>

          {/* INCOMING CALL (answer screen) */}
          <AnimatePresence>
            {view === 'call-incoming' && selected && (
              <CallPanel
                currentUser={currentUser}
                farmer={selected}
                isIncoming={true}
                incomingCallId={incomingCall?.id}
                onEnd={() => setView('list')}
              />
            )}
          </AnimatePresence>

          {/* LIST VIEW */}
          {view === 'list' && (
            <>
              <div className="fc-panel-head">
                <div>
                  <p className="fc-panel-title">Farmer Community</p>
                  <p className="fc-panel-sub">
                    <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {farmers.length} farmers near you
                  </p>
                </div>
                <button className="fc-close" onClick={onClose}><X size={17} /></button>
              </div>
              <div className="fc-search-wrap">
                <div className="fc-search">
                  <Search size={14} className="fc-search-ico" />
                  <input
                    className="fc-search-inp"
                    placeholder="Search farmer, instrument, crop…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="fc-list">
                {loading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
                    <div className="chat-typing-indicator" style={{ margin: '0 auto 10px', width: 'fit-content' }}>
                      <span /><span /><span />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>Finding farmers nearby…</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center' }}>
                    <Users size={40} style={{ color: 'var(--green-mid)', margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>No farmers found</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500 }}>Try broadening your search or check back later.</p>
                  </div>
                ) : (
                  filtered.map(farmer => (
                    <FarmerCard
                      key={farmer.id}
                      farmer={farmer}
                      onClick={() => { setSelected(farmer); setView('detail'); }}
                      onChat={() => { setSelected(farmer); setView('chat'); }}
                      onCall={() => { setSelected(farmer); setView('call'); }}
                      onBorrow={() => { setSelected(farmer); setView('borrow'); }}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* DETAIL VIEW */}
          {view === 'detail' && selected && (
            <>
              <div className="fc-panel-head">
                <p className="fc-panel-title">Farmer Profile</p>
                <button className="fc-close" onClick={onClose}><X size={17} /></button>
              </div>
              <FarmerDetail
                currentUser={currentUser}
                farmer={selected}
                onBack={() => setView('list')}
                onChat={() => setView('chat')}
                onCall={() => setView('call')}
                onBorrow={() => setView('borrow')}
              />
            </>
          )}

          {/* CHAT VIEW */}
          {view === 'chat' && selected && (
            <LiveChat
              currentUser={currentUser}
              farmer={selected}
              onBack={() => setView('detail')}
              onCall={() => setView('call')}
            />
          )}

          {/* BORROW VIEW */}
          {view === 'borrow' && selected && (
            <>
              <div className="fc-panel-head">
                <div>
                  <p className="fc-panel-title">Borrow Request</p>
                  <p className="fc-panel-sub">Request instrument from {selected.name}</p>
                </div>
                <button className="fc-close" onClick={onClose}><X size={17} /></button>
              </div>
              <BorrowView
                currentUser={currentUser}
                farmer={selected}
                onBack={() => setView('detail')}
              />
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

/* ── FarmerCard extracted for cleaner renders ── */
const FarmerCard = ({ farmer, onClick, onChat, onCall, onBorrow }) => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const ref = doc(db, 'presence', farmer.uid || farmer.id.toString());
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const d = snap.data();
        const lastSeen = d.lastSeen?.toDate?.() || new Date(0);
        setOnline(d.online === true || (Date.now() - lastSeen.getTime()) < 90_000);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="fc-farmer-card" onClick={onClick}>
      <div className="fc-farmer-av-wrap">
        <div className="fc-farmer-av">{farmer.name?.charAt(0)}</div>
        {online && <span className="fc-av-online" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="fc-farmer-name">{farmer.name}</p>
        <p className="fc-farmer-loc"><MapPin size={10} />{farmer.village}</p>
        <div className="fc-farmer-pills">
          {farmer.instruments.slice(0, 2).map((inst, i) => (
            <span key={i} className="fc-inst-pill"><Tractor size={10} />{inst}</span>
          ))}
          {farmer.instruments.length > 2 && (
            <span className="fc-inst-pill">+{farmer.instruments.length - 2}</span>
          )}
        </div>
        <div className="fc-quick-btns" onClick={e => e.stopPropagation()}>
          <button className="fc-quick-chat" onClick={onChat}><MessageSquare size={12} /> Chat</button>
          <button className="fc-quick-call" onClick={onCall}><Phone size={12} /> Call</button>
          <button className="fc-quick-borrow" onClick={onBorrow}><Tractor size={12} /> Borrow</button>
        </div>
      </div>
      <div className="fc-farmer-right">
        <p className="fc-rating"><Star size={11} fill="currentColor" />{farmer.rating}</p>
        <p className="fc-dist">{farmer.distance}</p>
        <span className={`fc-avail ${farmer.available ? 'fc-avail--on' : 'fc-avail--off'}`}>
          {farmer.available ? 'Available' : 'Busy'}
        </span>
      </div>
    </div>
  );
};

export default FarmerCommunity;
