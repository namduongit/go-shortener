export const formatDate = (dateString: string) => {
    // dateString example: 2000-01-25T22:13:54.839324+07:00
    const date = new Date(dateString);
    return date.toLocaleDateString();
}