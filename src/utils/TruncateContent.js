export const truncateContent = (content, maxLength) => {
    const newlineIndex = content.indexOf('\n');

    if (newlineIndex !== -1 && newlineIndex < maxLength) {
        return content.substring(0, newlineIndex) + " ...";
    }

    return content.length > maxLength ? content.substring(0, maxLength) + " ..." : content;
};