import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_PRACTICES = 'custom_practices';
const STORAGE_KEY_FOLDERS = 'practice_folders';

export class CustomPracticesService {
  // Get all practices
  static getPractices() {
    try {
      const practices = localStorage.getItem(STORAGE_KEY_PRACTICES);
      return practices ? JSON.parse(practices) : [];
    } catch (error) {
      console.error('Error loading practices:', error);
      return [];
    }
  }

  // Get all folders
  static getFolders() {
    try {
      const folders = localStorage.getItem(STORAGE_KEY_FOLDERS);
      return folders ? JSON.parse(folders) : [];
    } catch (error) {
      console.error('Error loading folders:', error);
      return [];
    }
  }

  // Create a new practice
  static async createPractice({ name, description, duration, color, folderId = null }) {
    const practices = this.getPractices();
    const newPractice = {
      id: uuidv4(),
      name,
      description,
      duration,
      color,
      folderId,
      createdAt: new Date().toISOString(),
    };
    practices.push(newPractice);
    localStorage.setItem(STORAGE_KEY_PRACTICES, JSON.stringify(practices));
    return newPractice;
  }

  // Create a new folder
  static async createFolder({ name, color = '#E8D5F2', icon = '📁' }) {
    const folders = this.getFolders();
    const newFolder = {
      id: uuidv4(),
      name,
      color,
      icon,
      createdAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    return newFolder;
  }

  // Delete a practice
  static async deletePractice(practiceId) {
    const practices = this.getPractices();
    const filtered = practices.filter(p => p.id !== practiceId);
    localStorage.setItem(STORAGE_KEY_PRACTICES, JSON.stringify(filtered));
  }

  // Delete a folder (and clear folderId from practices in it)
  static async deleteFolder(folderId) {
    // Remove folder
    const folders = this.getFolders();
    const filtered = folders.filter(f => f.id !== folderId);
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(filtered));

    // Clear folderId from practices
    const practices = this.getPractices();
    const updated = practices.map(p => 
      p.folderId === folderId ? { ...p, folderId: null } : p
    );
    localStorage.setItem(STORAGE_KEY_PRACTICES, JSON.stringify(updated));
  }

  // Move practice to a folder
  static async movePracticeToFolder(practiceId, folderId) {
    const practices = this.getPractices();
    const updated = practices.map(p =>
      p.id === practiceId ? { ...p, folderId } : p
    );
    localStorage.setItem(STORAGE_KEY_PRACTICES, JSON.stringify(updated));
  }

  // Get practices by folder
  static getPracticesByFolder(folderId) {
    const practices = this.getPractices();
    return practices.filter(p => p.folderId === folderId);
  }

  // Get uncategorized practices
  static getUncategorizedPractices() {
    const practices = this.getPractices();
    return practices.filter(p => !p.folderId);
  }
}
