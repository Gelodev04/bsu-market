"use client";
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Select, SelectItem } from "@heroui/react";
import { Input } from "@heroui/input";


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentLocation: string;
  onSave: (data: ProfileUpdateData) => void;
}

export interface ProfileUpdateData {
  username: string;
  location: string;
  imageFile: File | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  currentLocation,
  onSave
}) => {
  const [username, setUsername] = useState<string>(currentUsername);
  const [location, setLocation] = useState<string>(currentLocation);
  const [imagePreview, setImagePreview] = useState<string>('/images/seller1.jpg');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ username, location, imageFile });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-2 py-2 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          type="button"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-bsutheme text-white p-2 rounded-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            </div>
          </div>

          <div>

            <Input
           color="danger"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            label="Username"
            type="Text"
            variant="faded"
          />
          </div>

          <div>   
          <Select
            className=""
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            color="danger"
            variant="faded"
          >
            {[
              { value: "alangilan", label: "Alangilan" },
              { value: "pablo-borbon", label: "Pablo Borbon" },
            ].map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>
          

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-bsutheme rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;