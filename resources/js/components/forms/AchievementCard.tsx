import React from 'react';

interface PrestasiData {
    id: number;
    title: string;
    level: string;
    month: string;
    year: number;
    description: string;
    certificate_file?: string;
    supporting_file?: string;
}

interface AchievementCardProps {
    achievement: PrestasiData;
    onEdit: (achievement: PrestasiData) => void;
    onDelete: (id: number) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onEdit, onDelete }) => {
    return (
        <li className="p-4 border rounded shadow-sm bg-white">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h4 className="text-blue-600 font-bold text-lg">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Skala:</span> {achievement.level}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Periode:</span> {achievement.month} {achievement.year}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Deskripsi:</span> {achievement.description}
                    </p>
                </div>
                <div className="ml-4 flex space-x-2">
                    <button
                        onClick={() => onEdit(achievement)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(achievement.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        </li>
    );
};

export default AchievementCard;
