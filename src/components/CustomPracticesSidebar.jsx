import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomPracticesService } from '../services/customPracticesService';

export default function CustomPracticesSidebar({ onStartPractice }) {
  const [practices, setPractices] = useState([]);
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showCreatePracticeDialog, setShowCreatePracticeDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPractices(CustomPracticesService.getPractices());
    setFolders(CustomPracticesService.getFolders());
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const uncategorizedPractices = practices.filter(p => !p.folderId);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-hanken font-semibold text-sm text-[#1e2d2e]">
          My Custom Practices
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setShowCreateFolderDialog(true)}
            className="p-1.5 hover:bg-[#1e2d2e]/5 rounded-lg transition-colors"
            title="Create Folder"
          >
            📁
          </button>
          <button
            onClick={() => setShowCreatePracticeDialog(true)}
            className="p-1.5 hover:bg-[#1e2d2e]/5 rounded-lg transition-colors"
            title="Create Practice"
          >
            ➕
          </button>
        </div>
      </div>

      {/* Uncategorized Practices */}
      {uncategorizedPractices.map(practice => (
        <PracticeCard
          key={practice.id}
          practice={practice}
          onStart={() => onStartPractice(practice)}
        />
      ))}

      {/* Folders */}
      {folders.map(folder => {
        const folderPractices = practices.filter(p => p.folderId === folder.id);
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <div key={folder.id} className="space-y-2">
            {/* Folder Header */}
            <button
              onClick={() => toggleFolder(folder.id)}
              className="w-full flex items-center justify-between p-2 hover:bg-[#1e2d2e]/5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{isExpanded ? '📂' : '📁'}</span>
                <span className="text-xs font-hanken font-medium text-[#1e2d2e]">
                  {folder.icon} {folder.name}
                </span>
                <span className="text-[10px] text-[#1e2d2e]/40">
                  ({folderPractices.length})
                </span>
              </div>
              <span className="text-[10px] text-[#1e2d2e]/30">
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>

            {/* Folder Practices */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-4 space-y-2"
                >
                  {folderPractices.map(practice => (
                    <PracticeCard
                      key={practice.id}
                      practice={practice}
                      onStart={() => onStartPractice(practice)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Create Practice Dialog */}
      {showCreatePracticeDialog && (
        <CreatePracticeDialog
          folders={folders}
          onClose={() => setShowCreatePracticeDialog(false)}
          onCreated={() => {
            loadData();
            setShowCreatePracticeDialog(false);
          }}
        />
      )}

      {/* Create Folder Dialog */}
      {showCreateFolderDialog && (
        <CreateFolderDialog
          onClose={() => setShowCreateFolderDialog(false)}
          onCreated={() => {
            loadData();
            setShowCreateFolderDialog(false);
          }}
        />
      )}
    </div>
  );
}

function PracticeCard({ practice, onStart }) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{ backgroundColor: practice.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-hanken font-semibold text-xs text-[#1e2d2e] truncate">
            {practice.name}
          </h4>
          <p className="text-[10px] text-[#1e2d2e]/70 mt-0.5 truncate">
            {practice.description}
          </p>
          <p className="text-[10px] text-[#1e2d2e]/50 mt-1">
            {practice.duration}
          </p>
        </div>
        <button
          onClick={onStart}
          className="shrink-0 px-2 py-1 bg-white/50 hover:bg-white/70 rounded text-[10px] font-hanken font-semibold text-[#1e2d2e] transition-colors"
        >
          Start
        </button>
      </div>
    </div>
  );
}

function CreatePracticeDialog({ folders, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('5 min');
  const [color, setColor] = useState('#E8D5F2');
  const [folderId, setFolderId] = useState(null);

  const durations = ['1 min', '5 min', '10 min', '15 min', '20 min', '30 min'];
  const colors = ['#E8D5F2', '#C8E6C9', '#FFE082', '#FFCCBC', '#B2DFDB', '#D1C4E9'];

  const handleCreate = async () => {
    if (!name.trim()) return;
    await CustomPracticesService.createPractice({
      name: name.trim(),
      description: description.trim(),
      duration,
      color,
      folderId,
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-hanken font-bold text-xl text-[#1e2d2e] mb-4">
          Create Custom Practice
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-1">
              Practice Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#1e2d2e]/10 rounded-lg focus:outline-none focus:border-[#1e2d2e]/30 text-sm"
              placeholder="e.g., Morning Gratitude"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[#1e2d2e]/10 rounded-lg focus:outline-none focus:border-[#1e2d2e]/30 text-sm resize-none"
              rows="2"
              placeholder="A brief meditation to start your day..."
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-1">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-[#1e2d2e]/10 rounded-lg focus:outline-none focus:border-[#1e2d2e]/30 text-sm"
            >
              {durations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-[#1e2d2e] ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Folder */}
          {folders.length > 0 && (
            <div>
              <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-1">
                Folder (Optional)
              </label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value || null)}
                className="w-full px-3 py-2 border border-[#1e2d2e]/10 rounded-lg focus:outline-none focus:border-[#1e2d2e]/30 text-sm"
              >
                <option value="">No Folder</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.icon} {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#1e2d2e]/10 rounded-lg text-sm font-hanken font-medium text-[#1e2d2e]/60 hover:bg-[#1e2d2e]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-[#1e2d2e] rounded-lg text-sm font-hanken font-semibold text-white hover:bg-[#1e2d2e]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CreateFolderDialog({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#E8D5F2');

  const icons = ['📁', '🌙', '☀️', '🌟', '💼', '🏠', '🧘', '🎯', '💚', '🌸'];
  const colors = ['#E8D5F2', '#C8E6C9', '#FFE082', '#FFCCBC', '#B2DFDB', '#D1C4E9'];

  const handleCreate = async () => {
    if (!name.trim()) return;
    await CustomPracticesService.createFolder({
      name: name.trim(),
      icon,
      color,
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
      >
        <h2 className="font-hanken font-bold text-xl text-[#1e2d2e] mb-4">
          Create Folder
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-1">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#1e2d2e]/10 rounded-lg focus:outline-none focus:border-[#1e2d2e]/30 text-sm"
              placeholder="e.g., Morning Routine"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-2">
              Choose Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg border transition-all ${
                    icon === i
                      ? 'border-[#1e2d2e] bg-[#1e2d2e]/5'
                      : 'border-[#1e2d2e]/10 hover:border-[#1e2d2e]/30'
                  }`}
                >
                  <span className="text-xl">{i}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-hanken font-medium text-[#1e2d2e] mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-[#1e2d2e] ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#1e2d2e]/10 rounded-lg text-sm font-hanken font-medium text-[#1e2d2e]/60 hover:bg-[#1e2d2e]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-[#1e2d2e] rounded-lg text-sm font-hanken font-semibold text-white hover:bg-[#1e2d2e]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </motion.div>
    </div>
  );
}
