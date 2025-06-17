@component('mail::message')
# Pesan Kontak Baru

Seseorang telah mengirimkan pesan melalui formulir kontak di website.

**Nama:** {{ $contactMessage->name }}

**Email:** {{ $contactMessage->email }}

**Pesan:**
{{ $contactMessage->message }}

@component('mail::button', ['url' => route('admin.contact-messages.index')])
Kelola Semua Pesan
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
