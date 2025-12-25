import { useEffect } from 'react';

export type ExamSecurityOptions = {
    /**
     * Aktifkan blokir copy/cut/paste & context menu.
     * Default: true
     */
    blockClipboard?: boolean;
    /**
     * Aktifkan blokir drag & drop (kadang bisa dipakai untuk memindahkan teks).
     * Default: true
     */
    blockDragDrop?: boolean;
    /**
     * Aktifkan blokir select-all (Ctrl+A) agar kandidat tidak mudah menyeleksi semua teks.
     * Default: true
     */
    blockSelectAll?: boolean;
    /**
     * Callback opsional saat user mencoba melakukan aksi yang dilarang.
     * Contoh action: copy, paste, cut, ctrl+c, contextmenu, dragstart, drop, ctrl+a
     */
    onBlockedAction?: (action: string) => void;
};

/**
 * Hook untuk mengaktifkan “secure exam mode” pada halaman ujian.
 * Catatan: Ini hanya pencegahan di sisi client (tidak bisa 100% mencegah kecurangan),
 * tapi cukup efektif mengurangi copy/paste dan klik kanan.
 *
 * Contoh:
 *   useExamSecurity(currentPhase === 'test', {
 *     onBlockedAction: (action) => console.log('blocked', action)
 *   })
 */
export function useExamSecurity(enabled: boolean, options: ExamSecurityOptions = {}) {
    const {
        blockClipboard = true,
        blockDragDrop = true,
        blockSelectAll = true,
        onBlockedAction,
    } = options;

    useEffect(() => {
        if (!enabled) return;

        const notify = (action: string) => {
            try {
                onBlockedAction?.(action);
            } catch {
                // jangan sampai hook ini merusak flow ujian
            }
        };

        const prevent = (e: Event, action: string) => {
            e.preventDefault?.();
            if ('stopImmediatePropagation' in e && typeof (e as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation === 'function') {
                (e as Event & { stopImmediatePropagation: () => void }).stopImmediatePropagation();
            }
            e.stopPropagation?.();
            notify(action);
            return false;
        };

    const handleCopy = (e: ClipboardEvent) => (blockClipboard ? prevent(e, 'copy') : undefined);
    const handleCut = (e: ClipboardEvent) => (blockClipboard ? prevent(e, 'cut') : undefined);
    const handlePaste = (e: ClipboardEvent) => (blockClipboard ? prevent(e, 'paste') : undefined);
        const handleContextMenu = (e: MouseEvent) => prevent(e, 'contextmenu');

        const handleDragStart = (e: DragEvent) => (blockDragDrop ? prevent(e, 'dragstart') : undefined);
        const handleDrop = (e: DragEvent) => (blockDragDrop ? prevent(e, 'drop') : undefined);
        const handleDragOver = (e: DragEvent) => (blockDragDrop ? prevent(e, 'dragover') : undefined);

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key?.toLowerCase?.() ?? '';

            // Blokir shortcut clipboard umum
            if (blockClipboard && e.ctrlKey && (key === 'c' || key === 'v' || key === 'x')) {
                return prevent(e, `ctrl+${key}`);
            }

            // Blokir select-all
            if (blockSelectAll && e.ctrlKey && key === 'a') {
                return prevent(e, 'ctrl+a');
            }

            return;
        };

        // Capture phase (true) supaya lebih susah di-override oleh handler lain
        document.addEventListener('copy', handleCopy, true);
        document.addEventListener('cut', handleCut, true);
        document.addEventListener('paste', handlePaste, true);
        document.addEventListener('contextmenu', handleContextMenu, true);

        document.addEventListener('dragstart', handleDragStart, true);
        document.addEventListener('dragover', handleDragOver, true);
        document.addEventListener('drop', handleDrop, true);

        document.addEventListener('keydown', handleKeyDown, true);

        // (Opsional, tapi membantu): kurangi kemampuan select text via CSS
        const previousSelect = document.documentElement.style.userSelect;
        document.documentElement.style.userSelect = 'none';

        return () => {
            document.removeEventListener('copy', handleCopy, true);
            document.removeEventListener('cut', handleCut, true);
            document.removeEventListener('paste', handlePaste, true);
            document.removeEventListener('contextmenu', handleContextMenu, true);

            document.removeEventListener('dragstart', handleDragStart, true);
            document.removeEventListener('dragover', handleDragOver, true);
            document.removeEventListener('drop', handleDrop, true);

            document.removeEventListener('keydown', handleKeyDown, true);

            document.documentElement.style.userSelect = previousSelect;
        };
    }, [enabled, blockClipboard, blockDragDrop, blockSelectAll, onBlockedAction]);
}
