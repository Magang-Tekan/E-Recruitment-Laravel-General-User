import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  messages: {
    data: ContactMessage[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

export default function Index({ messages }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date);
  };

  const markAsRead = (id: number) => {
    Inertia.patch(route('admin.contact-messages.mark-read', id));
  };

  const deleteMessage = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      Inertia.delete(route('admin.contact-messages.destroy', id));
    }
  };

  return (
    <AppLayout>
      <Head title="Pesan Kontak" />

      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Pesan Kontak</h1>

        {messages.data.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center text-gray-500">Belum ada pesan kontak.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Pesan</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.data.map((message) => (
                  <tr key={message.id} className={!message.is_read ? 'bg-blue-50' : ''}>
                    <td className="py-3 px-4">{message.name}</td>
                    <td className="py-3 px-4">{message.email}</td>
                    <td className="py-3 px-4">
                      {message.message.length > 50
                        ? `${message.message.substring(0, 50)}...`
                        : message.message}
                    </td>
                    <td className="py-3 px-4">{formatDate(message.created_at)}</td>
                    <td className="py-3 px-4">
                      {message.is_read ? (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Dibaca
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Belum Dibaca
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link
                          href={route('admin.contact-messages.show', message.id)}
                          className="text-blue-600 hover:underline"
                        >
                          Lihat
                        </Link>

                        {!message.is_read && (
                          <button
                            onClick={() => markAsRead(message.id)}
                            className="text-green-600 hover:underline"
                          >
                            Tandai Dibaca
                          </button>
                        )}

                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {messages.last_page > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex space-x-2">
              {Array.from({ length: messages.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={route('admin.contact-messages.index', { page })}
                  className={`px-3 py-1 rounded ${
                    page === messages.current_page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {page}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
