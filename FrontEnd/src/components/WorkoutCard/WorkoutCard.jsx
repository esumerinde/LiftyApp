import { useEffect, useRef, useState, useContext, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Clock,
  Dumbbell,
  Heart,
  MessageCircle,
  Share2,
  Upload,
  Save,
  Copy,
  Edit,
  Trash2,
  UserPlus,
  Repeat,
} from "lucide-react";
import {
  likeWorkout,
  getComments,
  addComment,
  deleteComment,
  getWorkoutLogExercises,
  getWorkoutLikes,
} from "../../services/workoutLogsService";
import { followUser, unfollowUser } from "../../services/usersService";
import { AuthContext } from "../../context/AuthContext";
import "./WorkoutCard.css";

const WorkoutCard = ({
  workout,
  isOwnWorkout = false,
  isFollowing = false,
  onFollowChange,
  inProfile = false,
}) => {
  const {
    id,
    user,
    title,
    timeAgo,
    duration,
    volume,
    totalReps,
    likes,
    comments,
    image,
    latestComment,
    liked = false,
  } = workout;

  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(liked);
  const [likesCount, setLikesCount] = useState(likes);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [exercisesList, setExercisesList] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [likesList, setLikesList] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(isFollowing);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const menuRef = useRef(null);

  // Sincronizar estado local con prop
  useEffect(() => {
    setIsFollowingUser(isFollowing);
  }, [isFollowing]);

  // Cargar ejercicios y comentarios al montar el componente
  useEffect(() => {
    const loadExercises = async () => {
      if (!id) return;

      setLoadingExercises(true);
      const result = await getWorkoutLogExercises(id);

      if (result.success && result.data?.exercises) {
        setExercisesList(result.data.exercises);
      } else {
        console.error("Error al cargar ejercicios:", result.message);
        setExercisesList([]);
      }
      setLoadingExercises(false);
    };

    const loadComments = async () => {
      if (!id) return;

      setLoadingComments(true);
      const result = await getComments(id);
      if (result.success) {
        const formattedComments = (result.data.comments || []).map(
          (comment) => ({
            ...comment,
            timeAgo: getTimeAgo(comment.created_at),
          })
        );
        setCommentsList(formattedComments);
      }
      setLoadingComments(false);
    };

    loadExercises();
    loadComments();
  }, [id]);

  // Cargar likes cuando hay likes
  useEffect(() => {
    const loadLikes = async () => {
      if (!id || likesCount === 0) {
        setLikesList([]);
        return;
      }

      setLoadingLikes(true);
      const result = await getWorkoutLikes(id);

      if (result.success && result.data?.likes) {
        // Backend devuelve { success: true, likes: [...] }
        setLikesList(result.data.likes || []);
      } else {
        console.error("Error al cargar likes:", result.message);
        setLikesList([]);
      }
      setLoadingLikes(false);
    };

    loadLikes();
  }, [id, likesCount]);

  // Actualizar estado de like cuando cambia el prop
  useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const currentCard = cardRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: "20px",
      }
    );

    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  const handleShareWorkout = () => {
    console.log("Compartir entreno");
    setShowMenu(false);
  };

  const handleSaveAsRoutine = () => {
    console.log("Guardar como rutina");
    setShowMenu(false);
  };

  const handleCopyWorkout = () => {
    console.log("Copiar entreno");
    setShowMenu(false);
  };

  const handleEditWorkout = () => {
    console.log("Editar entreno");
    setShowMenu(false);
  };

  const handleDeleteWorkout = () => {
    console.log("Borrar entreno");
    setShowMenu(false);
  };

  const handleFollowUser = async () => {
    if (!user?.id) return;

    try {
      const wasFollowing = isFollowingUser;

      // Optimistic update
      setIsFollowingUser(!wasFollowing);

      // Call backend
      const result = wasFollowing
        ? await unfollowUser(user.id)
        : await followUser(user.id);

      if (result.success) {
        // Notificar al padre para que actualice followingIds
        if (onFollowChange) {
          onFollowChange(user.id, !wasFollowing);
        }
      } else {
        // Revert on error
        setIsFollowingUser(wasFollowing);
        console.error("Error al seguir/dejar de seguir:", result.message);
      }
    } catch (error) {
      console.error("Error en handleFollowUser:", error);
      setIsFollowingUser(isFollowing);
    }

    setShowMenu(false);
  };

  const handleToggleLike = async () => {
    if (!id) return;

    // Optimistic update
    const wasLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    // Call backend
    const result = await likeWorkout(id);

    if (result.success) {
      // Use backend response as source of truth
      setIsLiked(result.data.liked);
      setLikesCount(result.data.likes_count);

      // Recargar lista de likes para actualizar el modal
      if (result.data.likes_count > 0) {
        const likesResult = await getWorkoutLikes(id);
        if (likesResult.success && likesResult.data?.likes) {
          // Backend devuelve { success: true, likes: [...] }
          setLikesList(likesResult.data.likes || []);
        } else {
          setLikesList([]);
        }
      } else {
        setLikesList([]);
      }
    } else {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount(prevCount);
      console.error("Error al dar like:", result.message);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "ahora";
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const result = await addComment(id, newCommentText);
    if (result.success) {
      // Crear el nuevo comentario
      const newComment = {
        id_comment: result.data.id_comment,
        id_user: currentUser?.id_user,
        username: currentUser?.username,
        full_name: currentUser?.full_name,
        content: newCommentText,
        created_at: new Date().toISOString(),
        timeAgo: "ahora",
        avatar_url: currentUser?.avatar_url || currentUser?.profile_image_url,
      };

      // Agregar al final de la lista (orden cronológico)
      setCommentsList([...commentsList, newComment]);
      setCommentsCount((prev) => prev + 1);
      setNewCommentText("");
    } else {
      console.error("Error al agregar comentario:", result.message);
    }
  };

  const handleDeleteCommentClick = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    const result = await deleteComment(commentToDelete);
    if (result.success) {
      // Eliminar el comentario de la lista
      setCommentsList(
        commentsList.filter((c) => c.id_comment !== commentToDelete)
      );
      setCommentsCount((prev) => prev - 1);
    } else {
      console.error("Error al eliminar comentario:", result.message);
    }

    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  const handleUserClick = (username) => {
    // No navegar si es el mismo usuario logueado
    if (currentUser?.username === username) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/profile/${username}`);
  };

  // Generar iniciales a partir del nombre
  const getInitials = (name, username) => {
    if (!name && !username) return "?";
    const displayName = name || username;
    const words = displayName.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  // Renderizar avatar con fallback a iniciales
  const renderAvatar = (avatarUrl, name, username, className, onClick) => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={username || name}
          className={className}
          onClick={onClick}
          style={{ cursor: onClick ? "pointer" : "default" }}
        />
      );
    }
    return (
      <div
        className={`${className} avatar-initials`}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        {getInitials(name, username)}
      </div>
    );
  };

  return (
    <article
      ref={cardRef}
      className={`workout-card lifty-card ${isVisible ? "card-visible" : ""}`}
    >
      {/* Header de la Card */}
      <div className="workout-card-header">
        <div className="user-info">
          <img
            src={user.avatar}
            alt={user.name}
            className="user-avatar"
            onClick={() => handleUserClick(user.username)}
            style={{ cursor: "pointer" }}
          />
          <div className="user-details">
            <h3
              className="user-name"
              onClick={() => handleUserClick(user.username)}
              style={{ cursor: "pointer" }}
            >
              {user.name}
            </h3>
            <span className="time-ago">{timeAgo}</span>
          </div>
        </div>

        {/* Menú de opciones */}
        <div className="options-menu-wrapper" ref={menuRef}>
          {!inProfile && (
            <>
              {!isOwnWorkout && !isFollowingUser ? (
                <button
                  className="follow-user-btn"
                  onClick={handleFollowUser}
                  aria-label="Seguir usuario"
                >
                  <UserPlus size={18} strokeWidth={2} />
                  <span>Seguir</span>
                </button>
              ) : !isOwnWorkout && isFollowingUser ? (
                <button
                  className="following-user-btn"
                  onClick={handleFollowUser}
                  aria-label="Siguiendo"
                >
                  <UserPlus size={18} strokeWidth={2} />
                  <span>Siguiendo</span>
                </button>
              ) : (
                <>
                  <button
                    className="options-btn"
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="Más opciones"
                  >
                    <MoreVertical size={20} strokeWidth={2} />
                  </button>

                  {showMenu && (
                    <div className="options-dropdown">
                      {isOwnWorkout ? (
                        <>
                          <button
                            className="dropdown-item"
                            onClick={handleShareWorkout}
                          >
                            <Upload size={18} strokeWidth={2} />
                            <span>Compartir Entrenamiento</span>
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={handleSaveAsRoutine}
                          >
                            <Save size={18} strokeWidth={2} />
                            <span>Guardar como Rutina</span>
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={handleCopyWorkout}
                          >
                            <Copy size={18} strokeWidth={2} />
                            <span>Copiar Entrenamiento</span>
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={handleEditWorkout}
                          >
                            <Edit size={18} strokeWidth={2} />
                            <span>Editar Entrenamiento</span>
                          </button>
                          <button
                            className="dropdown-item delete-item"
                            onClick={handleDeleteWorkout}
                          >
                            <Trash2 size={18} strokeWidth={2} />
                            <span>Borrar Entrenamiento</span>
                          </button>
                        </>
                      ) : (
                        <button
                          className="dropdown-item"
                          onClick={handleFollowUser}
                        >
                          <UserPlus size={18} strokeWidth={2} />
                          <span>Seguir</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Título y Métricas */}
      <div className="workout-title-section">
        <h2 className="workout-title">{title}</h2>
        <div className="workout-metrics">
          <div className="metric-item">
            <Clock className="metric-icon" size={16} strokeWidth={2} />
            <span className="metric-text">{duration}</span>
          </div>
          <div className="metric-item">
            <Dumbbell className="metric-icon" size={16} strokeWidth={2} />
            <span className="metric-text">{volume}</span>
          </div>
          {totalReps > 0 && (
            <div className="metric-item">
              <Repeat className="metric-icon" size={16} strokeWidth={2} />
              <span className="metric-text">{totalReps} reps</span>
            </div>
          )}
        </div>
      </div>

      {/* Imagen del entreno (opcional) */}
      {image && (
        <div className="workout-image-container">
          <img src={image} alt={title} className="workout-image" />
        </div>
      )}

      {/* Lista de Ejercicios */}
      <div className="exercises-list">
        {loadingExercises ? (
          <div className="exercise-row">
            <div className="exercise-info">
              <span
                className="exercise-name"
                style={{ color: "var(--lifty-text-secondary)" }}
              >
                Cargando ejercicios...
              </span>
            </div>
          </div>
        ) : exercisesList && exercisesList.length > 0 ? (
          <>
            {exercisesList.slice(0, 3).map((exercise, index) => {
              // Calcular stats del ejercicio
              const totalSets = exercise.sets?.length || 0;
              const completedSets =
                exercise.sets?.filter((s) => s.done).length || 0;
              const avgWeight =
                exercise.sets?.length > 0
                  ? (
                      exercise.sets.reduce((sum, s) => sum + (s.kg || 0), 0) /
                      exercise.sets.length
                    ).toFixed(1)
                  : null;
              const avgReps =
                exercise.sets?.length > 0
                  ? Math.round(
                      exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) /
                        exercise.sets.length
                    )
                  : null;

              return (
                <div key={index} className="exercise-row">
                  <div className="exercise-thumbnail">
                    {exercise.thumbnail ? (
                      <img src={exercise.thumbnail} alt={exercise.name} />
                    ) : (
                      <Dumbbell
                        className="placeholder-icon"
                        size={24}
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  <div className="exercise-info">
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-stats">
                      {completedSets}/{totalSets} Series
                      {avgReps && ` · ${avgReps} Reps`}
                      {avgWeight && avgWeight > 0 && ` · ${avgWeight}kg`}
                    </span>
                  </div>
                </div>
              );
            })}
            {exercisesList.length > 3 && (
              <button
                className="lifty-btn-small show-more-btn"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  navigate(`/workout/${id}`);
                }}
              >
                Ver entrenamiento completo
              </button>
            )}
          </>
        ) : (
          <div className="exercise-row">
            <div className="exercise-info">
              <span
                className="exercise-name"
                style={{ color: "var(--lifty-text-secondary)" }}
              >
                Sin ejercicios registrados
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Social */}
      {!inProfile && (
        <div className="workout-card-footer">
          <button
            className={`lifty-btn-small social-btn ${isLiked ? "liked" : ""}`}
            onClick={handleToggleLike}
            aria-label="Me gusta"
          >
            <Heart
              className="social-icon"
              size={20}
              strokeWidth={2}
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="social-count">{likesCount}</span>
          </button>
          <button className="lifty-btn-small social-btn" aria-label="Comentar">
            <MessageCircle className="social-icon" size={20} strokeWidth={2} />
            <span className="social-count">{commentsCount}</span>
          </button>
          <button className="lifty-btn-small social-btn" aria-label="Compartir">
            <Share2 className="social-icon" size={20} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Likes Avatars - Instagram style - SOLO DATOS REALES */}
      {!inProfile && likesCount > 0 && likesList.length > 0 && (
        <div className="likes-section">
          <div className="likes-avatars">
            {likesList.slice(0, 3).map((like) => (
              <div key={like.user_id || like.username}>
                {renderAvatar(
                  like.avatar_url,
                  like.full_name,
                  like.username,
                  "like-avatar",
                  () => handleUserClick(like.username)
                )}
              </div>
            ))}
          </div>
          <span
            className="likes-text"
            onClick={() => setShowLikesModal(true)}
            style={{ cursor: "pointer" }}
          >
            Le gusta a{" "}
            <strong
              onClick={(e) => {
                e.stopPropagation();
                handleUserClick(likesList[0].username);
              }}
              style={{ cursor: "pointer" }}
            >
              {likesList[0].username}
            </strong>
            {likesCount > 1 && (
              <>
                {" "}
                y{" "}
                <strong>
                  {likesCount - 1} {likesCount === 2 ? "otro" : "otros"}
                </strong>
              </>
            )}
          </span>
        </div>
      )}

      {/* Modal de Likes - SOLO DATOS REALES */}
      {!inProfile && showLikesModal && (
        <div
          className="likes-modal-overlay"
          onClick={() => setShowLikesModal(false)}
        >
          <div
            className="likes-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="likes-modal-header">
              <h3>Me gusta</h3>
              <button
                className="likes-modal-close"
                onClick={() => setShowLikesModal(false)}
              >
                ×
              </button>
            </div>
            <div className="likes-modal-body">
              {likesList.length > 0 ? (
                likesList.map((like) => (
                  <div key={like.id_user} className="likes-modal-user">
                    {renderAvatar(
                      like.avatar_url,
                      like.full_name,
                      like.username,
                      "likes-modal-avatar",
                      () => {
                        setShowLikesModal(false);
                        handleUserClick(like.username);
                      }
                    )}
                    <div className="likes-modal-user-info">
                      <strong
                        className="likes-modal-username"
                        onClick={() => {
                          setShowLikesModal(false);
                          handleUserClick(like.username);
                        }}
                      >
                        {like.username}
                      </strong>
                      <span className="likes-modal-fullname">
                        {like.full_name}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="likes-modal-empty">No hay likes</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Section - Siempre visible */}
      {!inProfile && !loadingComments && commentsList.length > 0 && (
        <div className="comments-expanded-section">
          {commentsList.map((comment) => (
            <div key={comment.id_comment} className="comment-item">
              {renderAvatar(
                comment.avatar_url,
                comment.full_name,
                comment.username,
                "comment-avatar",
                () => handleUserClick(comment.username)
              )}
              <div className="comment-content">
                <p className="comment-text">
                  <strong
                    className="comment-username"
                    onClick={() => handleUserClick(comment.username)}
                    style={{ cursor: "pointer" }}
                  >
                    {comment.username}
                  </strong>{" "}
                  <span className="comment-message">{comment.content}</span>
                </p>
                <span className="comment-time">
                  {comment.timeAgo || "ahora"}
                </span>
              </div>
              {comment.id_user === currentUser?.id_user && (
                <button
                  className="comment-delete-btn"
                  onClick={() => handleDeleteCommentClick(comment.id_comment)}
                  aria-label="Eliminar comentario"
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Input - SIEMPRE VISIBLE AL FINAL */}
      {!inProfile && (
        <form className="add-comment-section" onSubmit={handleAddComment}>
          {renderAvatar(
            currentUser?.avatar_url || currentUser?.profile_image_url,
            currentUser?.full_name,
            currentUser?.username,
            "comment-input-avatar",
            null
          )}
          <input
            type="text"
            placeholder="Agregar un comentario..."
            className="comment-input"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
        </form>
      )}

      {/* Modal de confirmación para eliminar comentario */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={handleCancelDelete}>
          <div
            className="delete-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-header">
              <h3>Eliminar comentario</h3>
              <button
                className="delete-modal-close"
                onClick={handleCancelDelete}
              >
                ×
              </button>
            </div>
            <div className="delete-modal-body">
              <p>¿Estás seguro que querés eliminar este comentario?</p>
              <p className="delete-modal-warning">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={handleCancelDelete}
              >
                Cancelar
              </button>
              <button
                className="delete-modal-confirm"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default memo(WorkoutCard);
