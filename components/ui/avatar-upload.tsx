"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, User } from "lucide-react";
import { uploadAvatar, deleteAvatar } from "@/app/actions/user-management";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  userId: number;
  currentAvatarUrl?: string | null;
  userInitials?: string;
  onAvatarChange?: (newAvatarUrl: string | null) => void;
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  userInitials,
  onAvatarChange,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAvatar(file, userId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Trigger a refresh or callback
        if (onAvatarChange) {
          // In a real app, you'd get the new URL from the result
          onAvatarChange(
            `/avatars/${userId}-${Date.now()}.${file.name.split(".").pop()}`
          );
        }
        // Refresh the page to show the new avatar
        window.location.reload();
      } else {
        toast({
          title: "Upload failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAvatar(userId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        if (onAvatarChange) {
          onAvatarChange(null);
        }
        // Refresh the page to show the removed avatar
        window.location.reload();
      } else {
        toast({
          title: "Delete failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentAvatarUrl || undefined} alt="User avatar" />
          <AvatarFallback className="text-lg">
            {userInitials || <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>

        {currentAvatarUrl && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop an image here, or click to select
        </p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Choose File"}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
