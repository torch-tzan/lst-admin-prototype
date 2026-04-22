import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PhoneMockup from "@/components/PhoneMockup";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, RotateCcw, MoreVertical } from "lucide-react";

const OnlineLesson = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get("student") || searchParams.get("coach") || "生徒";
  const coachName = studentName;
  const durationMin = parseInt(searchParams.get("duration") || "50", 10);
  const totalSeconds = durationMin * 60;
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(totalSeconds - elapsed, 0);
  const remainingMin = Math.floor(remaining / 60);
  const remainingSec = remaining % 60;
  const progress = Math.min(elapsed / totalSeconds, 1);
  const isEnding = remaining <= 300; // last 5 min

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleEnd = () => {
    navigate("/messages");
  };

  return (
    <PhoneMockup hideStatusBar>
      <div className="flex flex-col h-full bg-black relative">
        {/* Status bar spacer */}
        <div className="flex-shrink-0 h-[50px]" />
        {/* Top bar */}
        <div className="absolute top-[50px] left-0 right-0 z-20">
          {/* Progress bar */}
          <div className="h-[3px] bg-white/10 w-full">
            <div
              className={`h-full transition-all duration-1000 ${isEnding ? "bg-destructive" : "bg-available"}`}
              style={{ width: `${(1 - progress) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between px-4 pt-2 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-white/90 text-xs font-medium">{formatTime(elapsed)}</span>
          </div>
          {/* Countdown */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm ${isEnding ? "bg-destructive/30" : "bg-white/10"}`}>
            <span className={`text-xs font-bold tabular-nums ${isEnding ? "text-destructive" : "text-white/90"}`}>
              残り {String(remainingMin).padStart(2, "0")}:{String(remainingSec).padStart(2, "0")}
            </span>
          </div>
          <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <MoreVertical className="w-4 h-4 text-white/80" />
          </button>
          </div>
        </div>

        {/* Coach video (top half) */}
        <div className="flex-1 relative bg-gradient-to-br from-[#1a2a3a] to-[#0d1b2a] overflow-hidden">
          {/* Simulated coach video with avatar */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-white/70">{studentName.charAt(0)}</span>
            </div>
            <p className="text-white/90 text-sm font-medium">{studentName}</p>
            <p className="text-white/40 text-xs mt-1">生徒</p>
          </div>
          {/* Decorative wave overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
          {/* Coach name tag */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Video className="w-3 h-3 text-available" />
            <span className="text-white text-[11px] font-medium">{studentName}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[2px] bg-white/10" />

        {/* Student video (bottom half) */}
        <div className="flex-1 relative bg-gradient-to-br from-[#2a1a2a] to-[#1a0d1a] overflow-hidden">
          {camOn ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Simulated student camera view */}
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-primary">あ</span>
              </div>
              <p className="text-white/60 text-xs">あなた</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/30 mb-2" />
              <p className="text-white/40 text-xs">カメラオフ</p>
            </div>
          )}
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/30 to-transparent" />
          {/* Student name tag */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
            {camOn ? (
              <Video className="w-3 h-3 text-available" />
            ) : (
              <VideoOff className="w-3 h-3 text-white/40" />
            )}
            <span className="text-white text-[11px] font-medium">あなた</span>
          </div>
          {/* Mic indicator */}
          {!micOn && (
            <div className="absolute bottom-3 right-3 bg-destructive/80 backdrop-blur-sm rounded-full p-1.5">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="flex-shrink-0 bg-[#111] px-4 pt-4 pb-2">
          <div className="flex items-center justify-center gap-5">
            {/* Mic toggle */}
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                micOn ? "bg-white/15" : "bg-destructive"
              }`}
            >
              {micOn ? (
                <Mic className="w-5 h-5 text-white" />
              ) : (
                <MicOff className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Camera toggle */}
            <button
              onClick={() => setCamOn(!camOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                camOn ? "bg-white/15" : "bg-destructive"
              }`}
            >
              {camOn ? (
                <Video className="w-5 h-5 text-white" />
              ) : (
                <VideoOff className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Flip camera */}
            <button className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>

            {/* Chat */}
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </button>

            {/* End call */}
            <button
              onClick={handleEnd}
              className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Home indicator */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-[134px] h-[5px] bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};

export default OnlineLesson;
