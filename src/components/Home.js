import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "antd";
import { CodeOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import Collaboration from "../assets/svg/Collaboration.svg";


function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both fields are required");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
    toast.success("Room is created");
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row min-h-screen items-center justify-center gap-20">

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-[600px] w-full"
          >
            <div className="bg-[#2d3b4a] p-10 rounded-3xl shadow-2xl border border-gray-700 backdrop-blur-md">
              <div className="text-center mb-10">
                <div className="flex justify-center items-center mb-5 gap-4">
                  <CodeOutlined className="text-[#28a745] backdrop-contrast-125 text-5xl" />
                  <h1 className="text-4xl font-bold text-white m-0 tracking-wide">DevCollab</h1>
                </div>
                <p className="text-gray-300 text-lg">Code Together in Real-Time</p>
              </div>

              <div className="space-y-6">
                <Input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ROOM ID"
                  onKeyUp={handleInputEnter}
                  className="hover:border-[#28a745] placeholder:text-gray-300"
                  style={{
                    backgroundColor: "#495057",
                    borderColor: "#495057",
                    color: "white",
                    fontSize: "1.1rem",
                    padding: "1rem",
                  }}
                />

                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  onKeyUp={handleInputEnter}
                  className="hover:border-[#28a745] placeholder:text-gray-300"
                  style={{
                    backgroundColor: "#495057",
                    borderColor: "#495057",
                    color: "white",
                    fontSize: "1.1rem",
                    padding: "1rem",
                  }}
                />

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={joinRoom}
                    className="w-full font-semibold hover:shadow-lg hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(to right, #1D98DB, #1D98DB)",
                      border: "none",
                      fontSize: "1.1rem",
                      height: "3.5rem",
                    }}
                  >
                    JOIN
                  </Button>
                </motion.div>

                <div className="text-center text-white pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={generateRoomId}
                    className="inline-flex items-center text-[#27a5f9] hover:text-[#00aaff]/90 font-medium text-lg gap-2"
                  >
                    <PlusCircleOutlined /> Generate Room ID
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SVG Image */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="lg:w-[500px] w-full flex justify-center items-center"
          >
            <img
              src={Collaboration}
              alt="Collaboration"
              className="w-full max-w-[500px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;
