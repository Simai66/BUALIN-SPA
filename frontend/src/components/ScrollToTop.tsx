import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // เด้งขึ้นบนสุดทุกครั้งเมื่อเปลี่ยนเส้นทาง
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};