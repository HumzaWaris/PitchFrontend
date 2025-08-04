import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from "../../lib/firebase";


export const uploadScheduleImage = async (file: File): Promise<string> => {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `schedules/schedule_${timestamp}_${file.name}`;
    
    // Create reference to storage location
    const storageRef = ref(storage, filename);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw new Error('Failed to upload image');
  }
}; 