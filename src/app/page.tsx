"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// A single, unified interface for our notes, matching the database structure
interface LearningNote {
  id: number;
  created_at: string;
  content: string;
  type: "text" | "image" | "speech";
}

// Add a global declaration for the window object to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
  const [noteContent, setNoteContent] = useState<string>("");
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  useEffect(() => {
    // Load notes from Supabase on initial render
    loadNotes();

    // Keep the speech recognition setup
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = "zh-CN"; // Set language to Chinese

      speechRecognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        setNoteContent(finalTranscript + interimTranscript);
      };

      speechRecognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }
  }, []);

  // Refactored to save a text note to Supabase
  const saveNote = async () => {
    if (noteContent.trim() === "") return;

    const { data, error } = await supabase
      .from("notes")
      .insert([{ content: noteContent, type: "text" }])
      .select();

    if (error) {
      console.error("Error saving note:", error);
    } else if (data) {
      // Add the new note returned from the database to our local state
      setNotes([...notes, ...data]);
      setNoteContent("");
    }
  };

  // Refactored to save image to Supabase.
  // Note: Storing images as base64 strings in the database is not ideal for performance.
  // We will refactor this later to use Supabase Storage for a more robust solution.
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const content = reader.result as string;
        const { data, error } = await supabase
          .from("notes")
          .insert([{ content, type: "image" }])
          .select();

        if (error) {
          console.error("Error saving image note:", error);
        } else if (data) {
          setNotes([...notes, ...data]);
        }
        // Clear the file input
        event.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeechRecognition = async () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
        // Save the final transcript to Supabase
        if (noteContent.trim() !== "") {
          const { data, error } = await supabase
            .from("notes")
            .insert([{ content: noteContent, type: "speech" }])
            .select();

          if (error) {
            console.error("Error saving speech note:", error);
          } else if (data) {
            setNotes([...notes, ...data]);
            setNoteContent("");
          }
        }
      } else {
        setNoteContent("");
        recognition.start();
        setIsListening(true);
      }
    }
  };

  // Refactored to load notes from Supabase
  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading notes:", error);
    } else {
      setNotes(data as LearningNote[]);
    }
  };

  // Refactored to delete a note from Supabase
  const deleteNote = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting note:", error);
    } else {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <main className="flex flex-col items-center w-full max-w-3xl p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">
          我的学习笔记
        </h1>

        <div className="w-full mb-6">
          <textarea
            className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
            rows={6}
            placeholder="记录你的学习内容..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          ></textarea>
          <input
            type="file"
            accept="image/*"
            className="mt-4 w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            onChange={handleImageUpload}
          />
          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            onClick={saveNote}
          >
            保存笔记
          </button>
          <button
            className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
            onClick={handleSpeechRecognition}
            disabled={!recognition}
          >
            {isListening ? "停止录音" : "开始录音"}
          </button>
        </div>

        <div className="w-full">
          {notes.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              还没有笔记，开始记录吧！
            </p>
          ) : (
            <ul className="space-y-4">
          {notes.map((note) => (
                  <li
                    key={note.id}
                    className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-800 flex justify-between items-start"
                  >
                    {note.type === "text" || note.type === "speech" ? (
                      <p className="text-black dark:text-white flex-1 mr-4">
                        {note.content}
                      </p>
                    ) : (
                      <img
                        src={note.content}
                        alt="学习图片"
                        className="max-w-full h-auto rounded-md flex-1 mr-4"
                      />
                    )}
                    <button
                      className="text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => deleteNote(note.id)}
                    >
                      删除
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
