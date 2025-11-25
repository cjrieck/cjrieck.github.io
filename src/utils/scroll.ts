/**
 * Smoothly scrolls to a section by its ID
 * @param sectionId - The ID of the section to scroll to (without #)
 * @param offset - Offset from the top (default 80px for navbar)
 */
export const scrollToSection = (sectionId: string, offset = 80): void => {
  const element = document.getElementById(sectionId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};
