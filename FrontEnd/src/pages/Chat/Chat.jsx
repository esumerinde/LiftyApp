// pages/Chat/Chat.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMessages } from "../../context/MessagesContext";
import {
  getChatMessages,
  sendMessage,
  getChatInfo,
} from "../../services/messagesService";
import { CHAT_THEMES, ChatThemePicker } from "./ChatThemes";
import "./Chat.css";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { updateUnreadCount } = useMessages();

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [menuMessageId, setMenuMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldScrollRef = useRef(true);

  // THEME STATE
  const [activeThemeKey, setActiveThemeKey] = useState(() => {
    return localStorage.getItem("lifty_chat_theme") || "classic";
  });

  const activeTheme = CHAT_THEMES[activeThemeKey] || CHAT_THEMES.classic;

  useEffect(() => {
    localStorage.setItem("lifty_chat_theme", activeThemeKey);
  }, [activeThemeKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll controlado
  useEffect(() => {
    if (shouldScrollRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [messages]);

  // Cargar chat inicial + polling
  useEffect(() => {
    let interval;

    const loadChat = async () => {
      setLoading(true);

      // Info del otro usuario
      const chatInfo = await getChatInfo(userId);
      if (chatInfo.success) {
        setOtherUser(chatInfo.data.user);
      }

      // Mensajes
      const result = await getChatMessages(userId);
      if (result.success) {
        setMessages(result.data);
        setTimeout(() => updateUnreadCount(), 500);
        shouldScrollRef.current = true;
      }

      setLoading(false);
    };

    loadChat();

    // Polling cada 3s
    interval = setInterval(async () => {
      const result = await getChatMessages(userId);
      if (result.success) {
        setMessages((prev) => {
          const prevLength = prev.length;
          const next = result.data;

          if (messagesContainerRef.current && next.length > prevLength) {
            const { scrollTop, scrollHeight, clientHeight } =
              messagesContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            if (isNearBottom) {
              shouldScrollRef.current = true;
            }
          }

          return next;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const result = await sendMessage(userId, messageToSend);

    if (result.success) {
      setMessages((prev) => [...prev, result.data.data]);
      shouldScrollRef.current = true;
    } else {
      // si falla, restaurar texto
      setNewMessage(messageToSend);
    }

    setSending(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMessageMenu = useCallback((msgId) => {
    setMenuMessageId(msgId);
  }, []);

  const handleCloseMenu = () => {
    setMenuMessageId(null);
  };

  const handleEditMessage = (msg) => {
    setEditingMessageId(msg.id_message);
    setEditValue(msg.content);
    setMenuMessageId(null);
  };

  const handleSaveEdit = async (msg) => {
    // TODO: hook a servicio editMessage
    setMessages((prev) =>
      prev.map((m) =>
        m.id_message === msg.id_message ? { ...m, content: editValue } : m
      )
    );
    setEditingMessageId(null);
    setEditValue("");
  };

  const handleDeleteMessage = async (msg) => {
    // TODO: hook a servicio deleteMessage
    setMessages((prev) => prev.filter((m) => m.id_message !== msg.id_message));
    setMenuMessageId(null);
  };

  if (loading) {
    return (
      <div className="chat-container chat-container-loading">
        <div className="chat-loading">
          <Loader className="spinner" size={32} />
          <p>Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="chat-container"
      style={{
        "--chat-bg": activeTheme.background,
        "--chat-accent": activeTheme.accent,
        "--chat-accent-soft": activeTheme.accentSoft,
        "--chat-header-bg":
          activeTheme.headerBg ||
          "linear-gradient(180deg, rgba(4,5,15,0.98), rgba(4,5,15,0.95))",
        "--chat-input-bg": activeTheme.inputBg || "rgba(4, 7, 20, 0.96)",
        "--chat-input-border":
          activeTheme.inputBorder ||
          activeTheme.accentSoft ||
          "rgba(123,131,214,0.6)",
        "--chat-bubble-sent-bg": activeTheme.bubbleSentBg,
        "--chat-bubble-sent-text": activeTheme.bubbleSentText,
        "--chat-bubble-received-bg": activeTheme.bubbleReceivedBg,
        "--chat-bubble-received-text": activeTheme.bubbleReceivedText,
      }}
    >
      {/* Capa de íconos decorativos */}
      <div className="chat-theme-icons-layer">
        {activeTheme.icons?.map((icon) => {
          const IconComp = icon.Icon;
          return (
            <IconComp
              key={icon.id}
              className="chat-theme-icon"
              size={icon.size}
              strokeWidth={1.7}
              style={{
                ...icon.style,
                opacity: icon.opacity ?? activeTheme.iconOpacity ?? 0.16,
                color: icon.color || "rgba(255,255,255,0.9)",
              }}
            />
          );
        })}
      </div>

      {/* Contenido real */}
      <div className="chat-content">
        {/* Header */}
        <div className="chat-header">
          <button
            className="chat-back-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "instant" });
              navigate("/messages");
            }}
            aria-label="Volver"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="chat-header-user">
            <img
              src={
                otherUser?.avatar_url ||
                `https://ui-avatars.com/api/?name=${otherUser?.full_name}&background=7882b6&color=fff&size=80`
              }
              alt={otherUser?.full_name}
              className="chat-header-avatar"
            />
            <div>
              <h2>{otherUser?.full_name}</h2>
              <p>@{otherUser?.username}</p>
            </div>
          </div>

          <div className="chat-header-actions">
            <ChatThemePicker
              activeThemeKey={activeThemeKey}
              onChangeTheme={setActiveThemeKey}
            />
          </div>
        </div>

        {/* Mensajes */}
        <div
          className="chat-messages"
          ref={messagesContainerRef}
          onClick={handleCloseMenu}
        >
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No hay mensajes aún</p>
              <p className="text-muted">
                Envía el primer mensaje para iniciar la conversación
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === currentUser.id_user;
              return (
                <div
                  key={msg.id_message}
                  className={`message ${isOwn ? "sent" : "received"}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (isOwn) handleMessageMenu(msg.id_message);
                  }}
                  onTouchStart={(e) => {
                    if (!isOwn) return;
                    const target = e.currentTarget;
                    const timer = setTimeout(
                      () => handleMessageMenu(msg.id_message),
                      500
                    );
                    const clear = () => clearTimeout(timer);
                    target.addEventListener("touchend", clear, {
                      once: true,
                    });
                    target.addEventListener("touchmove", clear, { once: true });
                  }}
                >
                  {editingMessageId === msg.id_message ? (
                    <div className="message-content editing">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="message-edit-input"
                      />
                      <div className="message-edit-actions">
                        <button
                          type="button"
                          className="message-menu-btn"
                          onClick={() => handleSaveEdit(msg)}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="message-menu-btn cancel"
                          onClick={() => setEditingMessageId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="message-content">
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {formatTime(msg.created_at)}
                      </span>

                      {menuMessageId === msg.id_message && isOwn && (
                        <div
                          className="message-menu"
                          onMouseLeave={handleCloseMenu}
                        >
                          <button
                            className="message-menu-btn"
                            type="button"
                            onClick={() => handleEditMessage(msg)}
                          >
                            Editar
                          </button>
                          <button
                            className="message-menu-btn danger"
                            type="button"
                            onClick={() => handleDeleteMessage(msg)}
                          >
                            Borrar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="chat-input"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!newMessage.trim() || sending}
            aria-label="Enviar mensaje"
          >
            {sending ? (
              <Loader className="spinner" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
