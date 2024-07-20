export const adjustPostOrCommentDateToUserTimezone = (dateString) => {
    const dateUtc = new Date(dateString);

    const offsetMinutes = new Date().getTimezoneOffset();
    const adjustedDate = new Date(dateUtc.getTime() - offsetMinutes * 60000);

    const localTimeString = adjustedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getDate()).padStart(2, '0');

    const dateFormatted = `${day}-${month}-${year}`;

    return `${localTimeString} ${dateFormatted}`;
};

export const adjustBirthDateToUserTimezone = (dateString) => {
    const dateUtc = new Date(dateString);

    const offsetMinutes = new Date().getTimezoneOffset();
    const adjustedDate = new Date(dateUtc.getTime() - offsetMinutes * 60000);

    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
};
