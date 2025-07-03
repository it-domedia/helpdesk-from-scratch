
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
}

export const MessageInput = ({ newMessage, setNewMessage, onSendMessage }: MessageInputProps) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex space-x-3">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          className="flex-1"
        />
        <Button 
          onClick={onSendMessage} 
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!newMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
