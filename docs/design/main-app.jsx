// ===== ChatFlow main app =====
// (rev)
const { useState, useRef, useEffect, useMemo } = React;

function App() {
  const [rooms, setRooms] = useState(() => ROOMS.map(r => ({ ...r, messages: [...r.messages] })));
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);
  const taRef = useRef(null);
  const typingTimer = useRef(null);

  const active = rooms.find(r => r.id === activeId);

  const filtered = useMemo(() => {
    if (!query.trim()) return rooms;
    const q = query.trim().toLowerCase();
    return rooms.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.messages.at(-1)?.text || '').toLowerCase().includes(q)
    );
  }, [rooms, query]);

  // scroll to bottom on room change / new message / typing
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, active?.messages.length, typing]);

  function openRoom(id) {
    setActiveId(id);
    setTyping(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    // clear unread
    setRooms(rs => rs.map(r => r.id === id ? { ...r, unread: 0 } : r));
  }

  function autosize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const t = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/^24/, '00');
    setRooms(rs => rs.map(r => r.id === activeId
      ? { ...r, messages: [...r.messages, { from: ME, t, text, read: false }] }
      : r));
    setDraft('');
    requestAnimationFrame(() => { if (taRef.current) taRef.current.style.height = 'auto'; });

    // simulate reply for DMs and groups
    const replyFrom = pickReplier(active);
    if (replyFrom) {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(true), 700);
      setTimeout(() => {
        setTyping(false);
        const rt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        setRooms(rs => rs.map(r => {
          if (r.id !== activeId) return r;
          // mark my last message as read
          const msgs = r.messages.map(m => m.from === ME ? { ...m, read: true } : m);
          return { ...r, messages: [...msgs, { from: replyFrom, t: rt, text: pickReply() }] };
        }));
      }, 2400);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="app">
      <Sidebar
        rooms={filtered}
        activeId={activeId}
        onOpen={openRoom}
        query={query}
        setQuery={setQuery}
      />
      {active ? (
        <ChatArea
          room={active}
          messagesRef={messagesRef}
          typing={typing}
          draft={draft}
          setDraft={(v) => { setDraft(v); requestAnimationFrame(autosize); }}
          onKey={onKey}
          send={send}
          taRef={taRef}
        />
      ) : (
        <EmptyChat onStart={() => openRoom('design')} />
      )}
      {active ? <RightPanel room={active} /> : <EmptyPanel />}
    </div>
  );
}

function pickReplier(room) {
  if (!room) return null;
  if (room.muted) return null;
  const others = room.online.filter(id => id !== ME);
  if (!others.length) return room.members.find(m => m !== ME) || null;
  return others[Math.floor(Math.random() * others.length)];
}
const REPLIES = [
  '오 좋은데요! 👍', '네 확인했습니다 :)', 'ㅎㅎ 그렇게 가시죠!', '좋아요, 바로 반영할게요.',
  '오케이 알겠습니다 🙌', '저도 동의해요!', '오 이거 괜찮은데요? 👀', '넵 처리하겠습니다.',
  '감사합니다! 🙏', '디테일 좋네요 ✨',
];
function pickReply() { return REPLIES[Math.floor(Math.random() * REPLIES.length)]; }

/* ============ LEFT SIDEBAR ============ */
function Sidebar({ rooms, activeId, onOpen, query, setQuery }) {
  const me = AV[ME];
  return (
    <aside className="sidebar">
      <div className="me-card">
        <Avatar person={me} size={42} status="online" />
        <div className="col" style={{ flex: 1, minWidth: 0 }}>
          <div className="me-name truncate">{me.name}</div>
          <div className="me-status"><span className="mini-dot"></span>온라인</div>
        </div>
        <button className="icon-btn" title="설정"><Ic.settings /></button>
      </div>

      <div className="search-wrap">
        <div className="search">
          <Ic.search style={{ color: 'var(--text-muted)', flex: 'none' }} />
          <input
            placeholder="채팅방 검색"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="list-label">
        <span>채팅방</span>
        <button className="icon-btn" style={{ width: 26, height: 26 }} title="새 채팅"><Ic.edit width={15} height={15} /></button>
      </div>

      <div className="room-list">
        {rooms.length === 0 && (
          <div style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
            검색 결과가 없어요
          </div>
        )}
        {rooms.map(room => (
          <RoomRow key={room.id} room={room} active={room.id === activeId} onOpen={onOpen} />
        ))}
      </div>
    </aside>
  );
}

function RoomRow({ room, active, onOpen }) {
  const last = room.messages.at(-1);
  const lastAuthor = last && last.from !== ME ? '' : last ? '나: ' : '';
  const preview = last ? lastAuthor + last.text : '';
  return (
    <div
      className={"room" + (active ? " active" : "") + (room.unread > 0 ? " unread" : "")}
      onClick={() => onOpen(room.id)}
    >
      <Avatar person={roomAvatarObj(room)} size={44} square={room.square}
        status={room.type === 'dm' ? (room.status || 'offline') : undefined} />
      <div className="room-main">
        <div className="room-top">
          <span className="room-name truncate">{room.name}</span>
          <span className="room-time">{last?.t || ''}</span>
        </div>
        <div className="room-bottom">
          <span className="room-preview truncate">{preview}</span>
          {room.unread > 0
            ? <span className="unread-badge">{room.unread}</span>
            : room.muted ? <span className="mute-badge"><Ic.bellOff /></span> : null}
        </div>
      </div>
    </div>
  );
}

/* ============ CENTER CHAT ============ */
function ChatArea({ room, messagesRef, typing, draft, setDraft, onKey, send, taRef }) {
  if (!room) return <div className="chat" />;
  const onlineCount = room.online.length;
  const typer = typing ? AV[pickFirstOnline(room)] : null;

  // group consecutive messages by author, insert date dividers
  const blocks = useMemo(() => buildBlocks(room.messages), [room.id, room.messages.length, room.messages.at(-1)?.read]);

  return (
    <main className="chat">
      <header className="chat-header">
        <Avatar person={roomAvatarObj(room)} size={38} square={room.square}
          status={room.type === 'dm' ? (room.status || 'offline') : undefined} />
        <div className="col" style={{ minWidth: 0 }}>
          <div className="chat-title truncate">{room.name}</div>
          <div className="chat-sub">
            {room.type === 'group'
              ? <span>멤버 {room.members.length}명 · <span style={{ color: 'var(--online)' }}>{onlineCount}명 온라인</span></span>
              : <span style={{ color: room.status === 'online' ? 'var(--online)' : 'var(--text-muted)' }}>{room.status === 'online' ? '● 온라인' : '오프라인'}</span>}
          </div>
        </div>
        <div className="spacer"></div>
        <button className="icon-btn" title="음성 통화"><Ic.phone /></button>
        <button className="icon-btn" title="영상 통화"><Ic.video /></button>
        <button className="icon-btn" title="고정된 메시지"><Ic.pin /></button>
      </header>

      <div className="messages" ref={messagesRef}>
        {blocks.map((b, i) =>
          b.type === 'date'
            ? <div className="date-divider" key={"d" + i}><span>{b.label}</span></div>
            : <MessageGroup key={"g" + i} block={b} room={room} />
        )}
        {typing && typer && (
          <div className="typing-row fade-in">
            <Avatar person={typer} size={34} />
            <div className="col" style={{ gap: 4 }}>
              <div className="typing-bubble">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="composer">
        <div className="composer-inner">
          <button className="icon-btn" title="파일 첨부" style={{ width: 32, height: 32 }}><Ic.attach /></button>
          <textarea
            ref={taRef}
            rows={1}
            placeholder={`${room.name}에 메시지 보내기`}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKey}
          />
          <div className="composer-tools">
            <button className="icon-btn" title="이모지" style={{ width: 32, height: 32 }}><Ic.emoji /></button>
            <button className="send-btn" onClick={send} disabled={!draft.trim()} title="전송 (Enter)">
              <Ic.send />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function pickFirstOnline(room) {
  return room.online.find(id => id !== ME) || room.members.find(id => id !== ME) || ME;
}

function MessageGroup({ block, room }) {
  const mine = block.from === ME;
  const person = AV[block.from];
  const last = block.items[block.items.length - 1];
  return (
    <div className={"msg-group " + (mine ? "me" : "them") + " fade-in"}>
      {!mine && <Avatar person={person} size={38} />}
      <div className="stack">
        {!mine && (
          <div className="msg-meta">
            <span className="msg-author">{person.name}</span>
            {room.type === 'dm' && person.role}
          </div>
        )}
        {block.items.map((m, idx) => {
          const isLast = idx === block.items.length - 1;
          return (
            <div className="bubble-line" key={idx}>
              <div className={"bubble " + (mine ? "mine" : "them")}>{m.text}</div>
              {isLast && (
                <div className="bubble-foot">
                  {mine && <span className={"read-tag" + (m.read ? "" : " unread-r")}>{m.read ? '읽음' : '안읽음'}</span>}
                  <span className="stamp">{m.t}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildBlocks(messages) {
  const out = [];
  let lastDate = null;
  let cur = null;
  messages.forEach(m => {
    if (m.d && m.d !== lastDate) {
      lastDate = m.d;
      out.push({ type: 'date', label: m.d });
      cur = null;
    }
    if (cur && cur.from === m.from) {
      cur.items.push(m);
    } else {
      cur = { type: 'group', from: m.from, items: [m] };
      out.push(cur);
    }
  });
  return out;
}

/* ============ RIGHT PANEL ============ */
function RightPanel({ room }) {
  if (!room) return <aside className="panel" />;
  const onlineSet = new Set(room.online);
  const members = room.members.map(id => ({ id, ...AV[id], online: onlineSet.has(id) }));
  members.sort((a, b) => (b.online - a.online));
  const onlineMembers = members.filter(m => m.online);
  const offlineMembers = members.filter(m => !m.online);

  return (
    <aside className="panel">
      <div className="panel-hero">
        <Avatar person={roomAvatarObj(room)} size={72} square={room.square}
          status={room.type === 'dm' ? (room.status || 'offline') : undefined} />
        <div className="ph-name">{room.name}</div>
        <div className="ph-desc">{room.desc}</div>
        <div className="panel-stats">
          <div className="stat">
            <div className="num">{room.members.length}</div>
            <div className="lbl">참여자</div>
          </div>
          <div className="stat">
            <div className="num" style={{ color: 'var(--online)' }}>{room.online.length}</div>
            <div className="lbl">온라인</div>
          </div>
          <div className="stat">
            <div className="num">{room.messages.length}</div>
            <div className="lbl">메시지</div>
          </div>
        </div>
      </div>

      <div className="panel-section-label">
        <span>참여자 — {members.length}</span>
        <button className="icon-btn" style={{ width: 26, height: 26 }} title="멤버 초대"><Ic.plus width={16} height={16} /></button>
      </div>

      <div className="members">
        {onlineMembers.length > 0 && (
          <div style={{ padding: '4px 10px 2px', fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>온라인 — {onlineMembers.length}</div>
        )}
        {onlineMembers.map(m => <MemberRow key={m.id} m={m} isMe={m.id === ME} owner={room.type === 'group' && m.id === ROOMS.find(r=>r.id===room.id).members[0]} />)}
        {offlineMembers.length > 0 && (
          <div style={{ padding: '12px 10px 2px', fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>오프라인 — {offlineMembers.length}</div>
        )}
        {offlineMembers.map(m => <MemberRow key={m.id} m={m} isMe={m.id === ME} />)}
      </div>
    </aside>
  );
}

function MemberRow({ m, isMe, owner }) {
  return (
    <div className={"member" + (m.online ? "" : " off")}>
      <Avatar person={m} size={36} status={m.online ? 'online' : 'offline'} />
      <div className="col" style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 6 }}>
          <span className="m-name truncate">{m.name}{isMe && ' (나)'}</span>
          {owner && <span className="role-pill">방장</span>}
        </div>
        <span className="m-role truncate">{m.online ? '온라인' : '오프라인'}</span>
      </div>
    </div>
  );
}

/* ============ EMPTY STATES ============ */
function EmptyChat({ onStart }) {
  return (
    <main className="chat empty-chat">
      <div className="empty-inner fade-in">
        <div className="empty-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>
          <span className="empty-logo-ping"></span>
        </div>
        <h2 className="empty-h">대화를 시작해보세요</h2>
        <p className="empty-p">왼쪽 목록에서 채팅방을 선택하거나<br />새로운 대화를 시작하세요.</p>
        <button className="empty-cta" onClick={onStart}>
          <Ic.edit width={17} height={17} />
          새 채팅 시작
        </button>
        <div className="empty-hints">
          <div className="empty-hint"><span className="eh-ic"><Ic.search width={15} height={15} /></span>채팅방 검색</div>
          <div className="empty-hint"><span className="eh-ic"><Ic.attach width={15} height={15} /></span>파일 공유</div>
          <div className="empty-hint"><span className="eh-ic" style={{ color: 'var(--accent)' }}>읽음</span>읽음 표시</div>
        </div>
      </div>
    </main>
  );
}

function EmptyPanel() {
  return (
    <aside className="panel empty-panel">
      <div className="empty-panel-inner">
        <div className="ep-ic">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div className="ep-t">채팅방 정보</div>
        <div className="ep-d">채팅방을 선택하면<br />참여자 정보가 표시됩니다.</div>
      </div>
    </aside>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
