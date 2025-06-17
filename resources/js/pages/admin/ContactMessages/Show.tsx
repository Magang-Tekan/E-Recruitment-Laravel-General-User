import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link } from '@inertiajs/react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  message: ContactMessage;
}

export default function Show({ message }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date);
  };

  const deleteMessage = () => {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      Inertia.delete(route('admin.contact-messages.destroy', message.id));
    }
  };

  return (
    <AppLayout>
      <Head title={`Pesan dari ${message.name}`} />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-4">
          <Link
            href={route('admin.contact-messages.index')}
            className="text-blue-600 hover:underline"
          >
            &larr; Kembali ke daftar pesan
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold">{message.name}</h1>
                <p className="text-gray-500">{message.email}</p>
                <p className="text-gray-400 text-sm mt-1">{formatDate(message.created_at)}</p>
              </div>
              
              <div className="flex space-x-2">
                {message.is_read ? (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Dibaca
                  </span>
                ) : (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Belum Dibaca
                  </span>
                )}
                
                <button
                  onClick={deleteMessage}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
