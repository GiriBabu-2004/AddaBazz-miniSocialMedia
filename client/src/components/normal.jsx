{chatOpen && (
        <div className="fixed bottom-20 right-6 bg-gray-800 border border-gray-600 text-white w-72 h-96 rounded-lg flex flex-col shadow-lg z-50">
          {/* Chat Header */}
          <div className="p-3 border-b border-gray-600 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chat</h3>
            <button
              onClick={() => setChatOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close chat"
            >
              ✖
            </button>
          </div>

          {/* Chat body */}
          <div
            className="flex-1 p-3 overflow-y-auto space-y-2"
            ref={messagesEndRef}
          >
            {!selectedUser ? (
              <>
                <p className="mb-2 text-gray-400">Select a user to chat:</p>
                <ul className="space-y-1 max-h-64 overflow-y-auto">
                  {mutuals.length === 0 && (
                    <li className="text-gray-500">No mutual followers available</li>
                  )}
                  {mutuals.map((mutual) => {
                    const isFollowing = user.following?.some((f) =>
                      areIdsEqual(f._id, mutual._id)
                    );
                    return (
                      <li
                        key={mutual._id}
                        onClick={() => setSelectedUser(mutual)}
                        className="cursor-pointer hover:bg-gray-700 p-2 rounded flex justify-between items-center"
                      >
                        <span>{mutual.username}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(
                              mutual._id,
                              isFollowing
                            );
                          }}
                          disabled={followLoading[mutual._id]}
                          className={`px-2 py-1 rounded text-xs ${
                            isFollowing ? "bg-red-600" : "bg-green-600"
                          } ${
                            followLoading[mutual._id] ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <>
                <div className="mb-2 flex justify-between items-center border-b border-gray-600 pb-2">
                  <h4>{selectedUser.username}</h4>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Back
                  </button>
                </div>
                <div className="flex flex-col space-y-1">
                  {messages.length === 0 && (
                    <p className="text-gray-500 text-sm text-center mt-4">
                      No messages yet. Say hi!
                    </p>
                  )}
                  {messages.map((msg, idx) => {
                    const fromMe = areIdsEqual(msg.sender, user._id);
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded max-w-[80%] ${
                          fromMe ? "bg-blue-600 self-end" : "bg-gray-700 self-start"
                        }`}
                      >
                         <div>{msg.content}</div>
        <div className="text-xs text-gray-300 mt-1 text-right">
  {msg.timestamp ? dayjs(msg.timestamp).format('HH:mm') : ''}
</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-2">
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md p-2 bg-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="mt-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}