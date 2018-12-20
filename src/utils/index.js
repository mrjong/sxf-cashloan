// 处理输入框失焦页面不回弹

export const handleInputBlur = () => {
  setTimeout(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    window.scrollTo(0, scrollTop);
  }, 100);
}
