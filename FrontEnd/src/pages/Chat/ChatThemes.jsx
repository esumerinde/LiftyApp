// components/ChatThemes/ChatThemes.jsx
import { useState } from "react";
import {
  Dumbbell,
  Sparkles,
  Heart,
  Leaf,
  Sun,
  MoonStar,
  Cat,
  Dog,
  Star,
  Cloud,
  Flame,
  Bone,
  Palette,
  X,
  Trees,
  Waves,
  Cake,
} from "lucide-react";

import "./ChatThemes.css";

/**
 * 12 temas. Cada uno:
 * - background: gradient del cuerpo
 * - accent / accentSoft: colores de header, input y botones
 * - bubbleSent / bubbleReceived: estilos de burbujas
 * - icons: 5 íconos Lucide por tema, todos visibles.
 */
export const CHAT_THEMES = {
  // 1) Lifty original
  classic: {
    key: "classic",
    label: "Classic",
    background:
      "radial-gradient(circle at 0% 0%, #151b3b 0%, #050816 55%, #020309 100%)",
    accent: "#7b83d6",
    accentSoft: "rgba(123, 131, 214, 0.55)",
    bubbleSentBg: "linear-gradient(135deg, #7b83d6, #5f6ed6)",
    bubbleSentText: "#ffffff",
    bubbleReceivedBg: "rgba(9, 12, 30, 0.98)",
    bubbleReceivedText: "#f6f6ff",
    iconOpacity: 0.16,
    icons: [
      {
        id: "classic-1",
        Icon: Dumbbell,
        size: 180,
        style: { top: "5%", left: "3%" },
      },
      {
        id: "classic-2",
        Icon: Dumbbell,
        size: 140,
        style: { top: "30%", right: "5%", transform: "rotate(20deg)" },
      },
      {
        id: "classic-3",
        Icon: Dumbbell,
        size: 130,
        style: { top: "55%", left: "8%" },
      },
      {
        id: "classic-4",
        Icon: Dumbbell,
        size: 150,
        style: { bottom: "12%", right: "8%" },
      },
      {
        id: "classic-5",
        Icon: Dumbbell,
        size: 120,
        style: { bottom: "3%", left: "40%" },
      },
    ],
  },

  // 2) Aurora (violet/cyan)
  aurora: {
    key: "aurora",
    label: "Aurora",
    background:
      "radial-gradient(circle at 0% 0%, #c471ff 0%, #5e4ff6 35%, #02c8ff 70%, #021024 100%)",
    accent: "#7fd8ff",
    accentSoft: "rgba(127, 216, 255, 0.5)",
    bubbleSentBg: "linear-gradient(135deg, #7f5dff, #63e3ff)",
    bubbleSentText: "#ffffff",
    bubbleReceivedBg: "rgba(5, 10, 33, 0.96)",
    bubbleReceivedText: "#f5fcff",
    iconOpacity: 0.16,
    icons: [
      {
        id: "aurora-1",
        Icon: Sparkles,
        size: 200,
        style: { top: "8%", left: "10%" },
      },
      {
        id: "aurora-2",
        Icon: Cloud,
        size: 160,
        style: { top: "32%", right: "5%" },
      },
      {
        id: "aurora-3",
        Icon: Star,
        size: 140,
        style: { top: "56%", left: "4%" },
      },
      {
        id: "aurora-4",
        Icon: Sparkles,
        size: 120,
        style: { bottom: "18%", right: "12%" },
      },
      {
        id: "aurora-5",
        Icon: Cloud,
        size: 130,
        style: { bottom: "5%", left: "55%" },
      },
    ],
  },

  // 3) Sunset (rosa / naranja)
  sunset: {
    key: "sunset",
    label: "Sunset",
    background:
      "linear-gradient(180deg, #ff9a9e 0%, #fecf6a 40%, #fd79a8 75%, #2b0820 100%)",
    accent: "#ff9aa9",
    accentSoft: "rgba(255, 154, 169, 0.6)",
    bubbleSentBg: "linear-gradient(135deg, #ff6f91, #ffc46b)",
    bubbleSentText: "#2c0a19",
    bubbleReceivedBg: "rgba(253, 245, 246, 0.95)",
    bubbleReceivedText: "#3a0a16",
    iconOpacity: 0.19,
    icons: [
      {
        id: "sunset-1",
        Icon: Sun,
        size: 180,
        style: { top: "5%", left: "4%" },
      },
      {
        id: "sunset-2",
        Icon: Cloud,
        size: 130,
        style: { top: "32%", right: "6%" },
      },
      {
        id: "sunset-3",
        Icon: Heart,
        size: 120,
        style: { top: "58%", left: "10%" },
      },
      {
        id: "sunset-4",
        Icon: Cloud,
        size: 140,
        style: { bottom: "15%", right: "10%" },
      },
      {
        id: "sunset-5",
        Icon: Sun,
        size: 130,
        style: { bottom: "3%", left: "42%" },
      },
    ],
  },

  // 4) Forest (verdes)
  forest: {
    key: "forest",
    label: "Forest",
    background:
      "radial-gradient(circle at 0% 0%, #4caf50 0%, #005c3b 40%, #002016 100%)",
    accent: "#4ade80",
    accentSoft: "rgba(74, 222, 128, 0.5)",
    bubbleSentBg: "linear-gradient(135deg, #11c66f, #1f8a4d)",
    bubbleSentText: "#eafff4",
    bubbleReceivedBg: "rgba(0, 22, 15, 0.96)",
    bubbleReceivedText: "#e0ffee",
    iconOpacity: 0.15,
    icons: [
      {
        id: "forest-1",
        Icon: Trees,
        size: 190,
        style: { top: "10%", left: "6%" },
      },
      {
        id: "forest-2",
        Icon: Leaf,
        size: 150,
        style: { top: "38%", right: "8%" },
      },
      {
        id: "forest-3",
        Icon: Trees,
        size: 130,
        style: { top: "60%", left: "14%" },
      },
      {
        id: "forest-4",
        Icon: Sun,
        size: 140,
        style: { bottom: "18%", right: "12%" },
      },
      {
        id: "forest-5",
        Icon: Leaf,
        size: 120,
        style: { bottom: "5%", left: "50%" },
      },
    ],
  },

  // 5) Ocean (cyan / azul)
  ocean: {
    key: "ocean",
    label: "Ocean",
    background:
      "linear-gradient(180deg, #00bcd4 0%, #0076d4 40%, #001220 100%)",
    accent: "#4dd0e1",
    accentSoft: "rgba(77, 208, 225, 0.55)",
    bubbleSentBg: "linear-gradient(135deg, #00c6ff, #0072ff)",
    bubbleSentText: "#e8f9ff",
    bubbleReceivedBg: "rgba(0, 19, 31, 0.96)",
    bubbleReceivedText: "#e4f7ff",
    iconOpacity: 0.15,
    icons: [
      {
        id: "ocean-1",
        Icon: Waves,
        size: 190,
        style: { top: "10%", left: "6%" },
      },
      {
        id: "ocean-2",
        Icon: Cloud,
        size: 140,
        style: { top: "38%", right: "10%" },
      },
      {
        id: "ocean-3",
        Icon: Waves,
        size: 120,
        style: { top: "62%", left: "15%" },
      },
      {
        id: "ocean-4",
        Icon: Cloud,
        size: 150,
        style: { bottom: "18%", right: "8%" },
      },
      {
        id: "ocean-5",
        Icon: Waves,
        size: 130,
        style: { bottom: "5%", left: "50%" },
      },
    ],
  },

  // 6) Love (rosa / rojo con corazones)
  love: {
    key: "love",
    label: "Love",
    background:
      "linear-gradient(180deg, #ff6b9d 0%, #ffc1e3 30%, #ff6b9d 60%, #c2185b 100%)",
    accent: "#ff4081",
    accentSoft: "rgba(255, 64, 129, 0.6)",
    bubbleSentBg: "linear-gradient(135deg, #ff69b4, #ff85c1)",
    bubbleSentText: "#ffffff",
    bubbleReceivedBg: "rgba(255, 240, 245, 0.96)",
    bubbleReceivedText: "#4a0520",
    iconOpacity: 0.18,
    icons: [
      {
        id: "love-1",
        Icon: Heart,
        size: 200,
        style: { top: "8%", left: "6%" },
      },
      {
        id: "love-2",
        Icon: Heart,
        size: 150,
        style: { top: "35%", right: "8%" },
      },
      {
        id: "love-3",
        Icon: Heart,
        size: 130,
        style: { top: "60%", left: "14%" },
      },
      {
        id: "love-4",
        Icon: Heart,
        size: 140,
        style: { bottom: "18%", right: "12%" },
      },
      {
        id: "love-5",
        Icon: Heart,
        size: 120,
        style: { bottom: "5%", left: "48%" },
      },
    ],
  },

  // 7) Night (azules oscuros con estrellas)
  night: {
    key: "night",
    label: "Night",
    background:
      "radial-gradient(circle at 0% 0%, #5b8ff9 0%, #1e3a8a 40%, #0f172a 75%, #020617 100%)",
    accent: "#93c5fd",
    accentSoft: "rgba(147, 197, 253, 0.5)",
    bubbleSentBg: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    bubbleSentText: "#ffffff",
    bubbleReceivedBg: "rgba(6, 10, 24, 0.97)",
    bubbleReceivedText: "#f9fbff",
    iconOpacity: 0.14,
    icons: [
      {
        id: "night-1",
        Icon: MoonStar,
        size: 190,
        style: { top: "10%", left: "8%" },
      },
      {
        id: "night-2",
        Icon: Star,
        size: 150,
        style: { top: "35%", right: "8%" },
      },
      {
        id: "night-3",
        Icon: Cloud,
        size: 120,
        style: { top: "60%", left: "14%" },
      },
      {
        id: "night-4",
        Icon: Star,
        size: 140,
        style: { bottom: "18%", right: "12%" },
      },
      {
        id: "night-5",
        Icon: Sparkles,
        size: 130,
        style: { bottom: "4%", left: "56%" },
      },
    ],
  },

  // 8) Cats (pastel)
  cats: {
    key: "cats",
    label: "Cats",
    background:
      "linear-gradient(180deg, #ffd1e5 0%, #f6c6ff 30%, #d2d9ff 65%, #c7deff 100%)",
    accent: "#f973b7",
    accentSoft: "rgba(249, 115, 183, 0.55)",
    bubbleSentBg: "linear-gradient(135deg, #ff9abf, #ffc6dd)",
    bubbleSentText: "#3c081b",
    bubbleReceivedBg: "rgba(255, 255, 255, 0.96)",
    bubbleReceivedText: "#36111e",
    iconOpacity: 0.2,
    icons: [
      {
        id: "cats-1",
        Icon: Cat,
        size: 190,
        style: { top: "6%", left: "6%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
      {
        id: "cats-2",
        Icon: Cat,
        size: 150,
        style: { top: "35%", right: "8%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
      {
        id: "cats-3",
        Icon: Sparkles,
        size: 120,
        style: { top: "60%", left: "14%" },
        color: "rgba(255, 255, 255, 0.85)",
      },
      {
        id: "cats-4",
        Icon: Heart,
        size: 140,
        style: { bottom: "18%", right: "10%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
      {
        id: "cats-5",
        Icon: Cat,
        size: 130,
        style: { bottom: "4%", left: "55%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
    ],
  },

  // 9) Dogs (cálido)
  dogs: {
    key: "dogs",
    label: "Dogs",
    background:
      "linear-gradient(180deg, #ffe1b0 0%, #ffc78a 30%, #f8a46c 55%, #4e2a12 100%)",
    accent: "#ffb26b",
    accentSoft: "rgba(255, 178, 107, 0.6)",
    bubbleSentBg: "linear-gradient(135deg, #ff9f6b, #ffcc7b)",
    bubbleSentText: "#3b1600",
    bubbleReceivedBg: "rgba(255, 249, 239, 0.97)",
    bubbleReceivedText: "#3a1905",
    iconOpacity: 0.19,
    icons: [
      {
        id: "dogs-1",
        Icon: Dog,
        size: 180,
        style: { top: "6%", left: "4%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
      {
        id: "dogs-2",
        Icon: Bone,
        size: 150,
        style: { top: "32%", right: "4%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
      {
        id: "dogs-3",
        Icon: Dog,
        size: 130,
        style: { top: "56%", left: "12%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
      {
        id: "dogs-4",
        Icon: Bone,
        size: 140,
        style: { bottom: "16%", right: "8%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
      {
        id: "dogs-5",
        Icon: Dog,
        size: 130,
        style: { bottom: "3%", left: "46%" },
        color: "rgba(255, 255, 255, 0.9)",
      },
    ],
  },

  // 10) Sparkles (tema más oscuro con gradients intensos)
  sparkles: {
    key: "sparkles",
    label: "Sparkles",
    background:
      "radial-gradient(circle at 0% 0%, #e0d5ff 0%, #c5a4ff 30%, #a0c4ff 65%, #89f0e8 100%)",
    accent: "#7c3aed",
    accentSoft: "rgba(124, 58, 237, 0.5)",
    bubbleSentBg: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    bubbleSentText: "#ffffff",
    bubbleReceivedBg: "rgba(255, 255, 255, 0.96)",
    bubbleReceivedText: "#1f102f",
    iconOpacity: 0.25,
    icons: [
      {
        id: "sparkles-1",
        Icon: Sparkles,
        size: 190,
        style: { top: "8%", left: "6%" },
        color: "rgba(139, 92, 246, 0.4)",
      },
      {
        id: "sparkles-2",
        Icon: Sparkles,
        size: 150,
        style: { top: "36%", right: "10%" },
        color: "rgba(6, 182, 212, 0.4)",
      },
      {
        id: "sparkles-3",
        Icon: Star,
        size: 130,
        style: { top: "62%", left: "15%" },
        color: "rgba(139, 92, 246, 0.4)",
      },
      {
        id: "sparkles-4",
        Icon: Star,
        size: 140,
        style: { bottom: "18%", right: "10%" },
        color: "rgba(6, 182, 212, 0.4)",
      },
      {
        id: "sparkles-5",
        Icon: Sparkles,
        size: 130,
        style: { bottom: "5%", left: "48%" },
        color: "rgba(139, 92, 246, 0.4)",
      },
    ],
  },

  // 11) Crimson (rojo con fuegos)
  crimson: {
    key: "crimson",
    label: "Crimson",
    background:
      "linear-gradient(180deg, #ff5f6d 0%, #d7263d 35%, #4a0410 100%)",
    accent: "#ff6b81",
    accentSoft: "rgba(255, 107, 129, 0.55)",
    bubbleSentBg: "linear-gradient(135deg, #ff4b5c, #ff9068)",
    bubbleSentText: "#2b0509",
    bubbleReceivedBg: "rgba(255, 242, 245, 0.97)",
    bubbleReceivedText: "#400611",
    iconOpacity: 0.15,
    icons: [
      {
        id: "crimson-1",
        Icon: Flame,
        size: 190,
        style: { top: "8%", left: "6%" },
      },
      {
        id: "crimson-2",
        Icon: Flame,
        size: 150,
        style: { top: "36%", right: "10%" },
      },
      {
        id: "crimson-3",
        Icon: Star,
        size: 130,
        style: { top: "62%", left: "16%" },
      },
      {
        id: "crimson-4",
        Icon: Flame,
        size: 140,
        style: { bottom: "18%", right: "12%" },
      },
      {
        id: "crimson-5",
        Icon: Flame,
        size: 130,
        style: { bottom: "5%", left: "48%" },
      },
    ],
  },

  // 12) Pastel (multi pastel más oscuro con tortas)
  pastel: {
    key: "pastel",
    label: "Pastel",
    background:
      "linear-gradient(180deg, #ffc4e1 0%, #ffe89a 35%, #b9ffc1 70%, #b0d9ff 100%)",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.55)",
    bubbleSentBg: "linear-gradient(135deg, #f97316, #facc15)",
    bubbleSentText: "#301103",
    bubbleReceivedBg: "rgba(255, 255, 255, 0.97)",
    bubbleReceivedText: "#3a1a05",
    iconOpacity: 0.22,
    icons: [
      {
        id: "pastel-1",
        Icon: Cake,
        size: 170,
        style: { top: "5%", left: "4%" },
        color: "rgba(249, 115, 22, 0.35)",
      },
      {
        id: "pastel-2",
        Icon: Heart,
        size: 140,
        style: { top: "32%", right: "5%" },
        color: "rgba(249, 115, 22, 0.35)",
      },
      {
        id: "pastel-3",
        Icon: Cake,
        size: 130,
        style: { top: "58%", left: "10%" },
        color: "rgba(249, 115, 22, 0.35)",
      },
      {
        id: "pastel-4",
        Icon: Sparkles,
        size: 140,
        style: { bottom: "15%", right: "8%" },
        color: "rgba(249, 115, 22, 0.35)",
      },
      {
        id: "pastel-5",
        Icon: Cake,
        size: 130,
        style: { bottom: "3%", left: "42%" },
        color: "rgba(249, 115, 22, 0.35)",
      },
    ],
  },
};

/**
 * Botón + popover para seleccionar tema.
 */
export const ChatThemePicker = ({ activeThemeKey, onChangeTheme }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (key) => {
    onChangeTheme(key);
    setOpen(false);
  };

  return (
    <div className="chat-theme-picker">
      <button
        type="button"
        className="chat-theme-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cambiar tema del chat"
      >
        <Palette size={20} />
      </button>

      {open && (
        <div className="chat-theme-popover">
          <div className="chat-theme-popover-header">
            <span>Chat theme</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          <div className="chat-theme-grid">
            {Object.values(CHAT_THEMES).map((theme) => (
              <button
                key={theme.key}
                type="button"
                className={`chat-theme-option ${
                  activeThemeKey === theme.key ? "active" : ""
                }`}
                onClick={() => handleSelect(theme.key)}
              >
                <div
                  className="chat-theme-swatch"
                  style={{ background: theme.background }}
                />
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
