export const normalizeFolderName = (folderName?: string | null): string => {
    const value = folderName?.trim();
    return value ? value : "root";
}