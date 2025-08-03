import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button, ConfigProvider, Select } from "antd";
import { motion } from "framer-motion";
import {
  CopyOutlined,
  LogoutOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const LANGUAGES = [
  "python3", "java", "cpp", "javascript", "nodejs", "c", "ruby", "go", "scala",
  "bash", "sql", "pascal", "csharp", "php", "swift", "rust", "r",
];

const THEMES = [
  "dracula", "monokai", "material", "material-darker", "material-palenight",
  "nord", "cobalt", "oceanic-next", "eclipse", "midnight", "base16-dark",
  "base16-light", "yonce", "ambiance", "blackboard", "mdn-like",
  "paraiso-dark", "paraiso-light", "shadowfox", "solarized dark",
  "solarized light", "the-matrix", "tomorrow-night-bright", "twilight", "zenburn",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [terminalText, setTerminalText] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const [selectedTheme, setSelectedTheme] = useState("blackboard");
  const [typingUser, setTypingUser] = useState("");
  const [remoteCode, setRemoteCode] = useState(""); // ✅ added for syncing code on refresh

  const codeRef = useRef("");
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      function handleErrors(err) {
        console.error("Socket error", err);
        toast.error("Socket connection failed, try again later");
        navigate("/");
      }

      const username = location.state?.username;

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username: joinedUser, socketId }) => {
        if (joinedUser !== username) {
          toast.success(`${joinedUser} joined the room`);
        }

        setClients(clients);

        // Send existing code/input to the new client
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
        socketRef.current.emit("SYNC_INPUT", {
          input: terminalText,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });

      socketRef.current.on("SHOW_TYPING", ({ username }) => {
        if (username !== location.state?.username) {
          setTypingUser(username);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000);
        }
      });

      socketRef.current.on("codeResponse", ({ output }) => {
        setIsExecuting(false);
        setTerminalText((prev) => {
          const cleanInput = prev.split(" Output:")[0]?.trim().replace(/^> ?/, "");
          return `> \n${cleanInput}\n\n Output:\n${output || "No output"}`;
        });
      });

      socketRef.current.on("LANGUAGE_CHANGE", ({ language }) => {
        setSelectedLanguage(language);
      });

      socketRef.current.on("INPUT_CHANGE", ({ input }) => {
        setTerminalText(input);
      });

      socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
        setRemoteCode(code); // ✅ Set remote code for Editor
        codeRef.current = code;
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off("SHOW_TYPING");
      socketRef.current.off("codeResponse");
      socketRef.current.off("LANGUAGE_CHANGE");
      socketRef.current.off("INPUT_CHANGE");
      socketRef.current.off(ACTIONS.SYNC_CODE);
    };
  }, []);

  if (!location.state) return <Navigate to="/" />;

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Failed to copy Room ID");
    }
  };

  const leaveRoom = () => navigate("/");

  const executeCode = () => {
    if (!codeRef.current.trim()) {
      toast.error("No code to execute");
      return;
    }

    setIsExecuting(true);
    const rawInput = terminalText.split(" Output:")[0].replace(/^> ?/, "");

    socketRef.current.emit("compileCode", {
      code: codeRef.current,
      roomId,
      language: selectedLanguage,
      input: rawInput.trim(),
    });
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#28a745", colorError: "#dc3545" } }}>
      <div className="min-h-screen flex bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] text-white transition-all duration-700">
        
        {/* Sidebar */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-1/6 bg-[#212529] text-white flex flex-col p-4 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <CodeOutlined className="text-[#28a745] text-3xl" />
            <h1 className="text-xl font-bold tracking-wide">DevCollab</h1>
          </div>
          <div className="flex-grow overflow-auto">
            <span className="text-gray-400 mb-2 block">👥 Members</span>
            {clients.map((client) => (
              <motion.div key={client.socketId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Client username={client.username} />
              </motion.div>
            ))}
            {typingUser && (
              <motion.p className="text-sm text-pink-400 italic mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {typingUser} is typing...
              </motion.p>
            )}
          </div>
          <div className="mt-auto space-y-2">
            <Button block icon={<CopyOutlined />} onClick={copyRoomId} className="h-10 text-white" style={{ backgroundColor: "#007bff" }}>Copy Room ID</Button>
            <Button block icon={<LogoutOutlined />} onClick={leaveRoom} className="h-10 text-white" style={{ backgroundColor: "#dc3545" }}>Leave Room</Button>
          </div>
        </motion.div>

        {/* Editor + Terminal */}
        <motion.div
          className="flex-grow flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-[#161b22] p-3 flex justify-end gap-2 shadow-md">
            <Select
              value={selectedLanguage}
              onChange={(lang) => {
                setSelectedLanguage(lang);
                socketRef.current.emit("LANGUAGE_CHANGE", { roomId, language: lang });
              }}
              style={{ width: 140 }}
              options={LANGUAGES.map((lang) => ({ value: lang, label: lang }))}
              showSearch
            />
            <Select
              value={selectedTheme}
              onChange={setSelectedTheme}
              style={{ width: 150 }}
              options={THEMES.map((theme) => ({ value: theme, label: theme }))}
              showSearch
            />
          </div>

          <Editor
            socketRef={socketRef}
            roomId={roomId}
            language={selectedLanguage}
            theme={selectedTheme}
            onCodeChange={(code) => {
              codeRef.current = code;
              socketRef.current.emit("TYPING", {
                roomId,
                username: location.state?.username,
              });
            }}
            initialCode={remoteCode} // ✅ set initial code on refresh
          />

          {/* Terminal */}
          <div className="bg-[#1e1e1e] p-4 border-t border-gray-700 shadow-inner space-y-0">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                icon={isExecuting ? <LoadingOutlined /> : <PlayCircleOutlined />}
                loading={isExecuting}
                onClick={executeCode}
                className="mb-3"
                style={{ backgroundColor: "#2490c3", borderColor: "#fff" }}
              >
                {isExecuting ? "Running..." : "Run Code"}
              </Button>
            </motion.div>

            <textarea
              value={terminalText}
              onChange={(e) => {
                setTerminalText(e.target.value);
                socketRef.current.emit("INPUT_CHANGE", {
                  roomId,
                  input: e.target.value,
                });
              }}
              className="w-full p-3 bg-[#2e2e2e] text-white rounded font-mono min-h-[200px] placeholder-gray-400 whitespace-pre-wrap"
              placeholder="Type your input here...\n\nWhen you run code, output will be shown below ⬇"
            />
          </div>
        </motion.div>
      </div>
    </ConfigProvider>
  );
}

export default EditorPage;
