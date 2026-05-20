const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  const showAlert = (msg) => {
    tg?.showAlert(msg);
  };

  const showConfirm = (msg) => {
    return tg?.showConfirm(msg);
  };

  const close = () => {
    tg?.close();
  };

  const expand = () => {
    tg?.expand();
  };

  const shareToTelegram = (url, text) => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const hapticFeedback = () => {
    tg?.HapticFeedback?.impactOccurred?.('medium');
  };

  return {
    tg,
    showAlert,
    showConfirm,
    close,
    expand,
    shareToTelegram,
    hapticFeedback,
    user: tg?.initDataUnsafe?.user,
  };
};

export default useTelegram;
