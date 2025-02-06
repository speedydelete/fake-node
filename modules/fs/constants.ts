
export const F_OK = 0;
export const X_OK = 1;
export const W_OK = 2;
export const R_OK = 4;

export const COPYFILE_EXCL = 1;
export const COPYFILE_FICLONE = 2;
export const COPYFILE_FICLONE_FORCE = 4;

export const O_RDONLY = 1;
export const O_WRONLY = 2;
export const O_RDWR = O_RDONLY | O_WRONLY;
export const O_CREAT = 4;
export const O_EXCL = 8;
export const O_NOCTTY = 16;
export const O_TRUNC = 32;
export const O_APPEND = 64;
export const O_DIRECTORY = 128;
export const O_NOATIME = 256;
export const O_NOFOLLOW = 512;
export const O_SYNC = 1024;
export const O_DSYNC = 2048;
export const O_SYMLINK = 4096;
export const O_DIRECT = 8192;
export const O_NONBLOCK = 16384;
export const UV_FS_O_FILEMAP = 32768;

export const S_IMFT = 0xF000;
export const S_IFREG = 0x8000;
export const S_IFDIR = 0x4000;
export const S_IFCHR = 0x2000;
export const S_IFBLK = 0x6000;
export const S_IFIFO = 0x1000;
export const S_IFLNK = 0xA000;
export const S_IFSOCK = 0xC000;

export const S_IRWXU = 0o700;
export const S_IRUSR = 0o400;
export const S_IWUSR = 0o200;
export const S_IXUSR = 0o100;
export const S_IRWXG = 0o070;
export const S_IRGRP = 0o040;
export const S_IWGRP = 0o020;
export const S_IXGRP = 0o010;
export const S_IRWXO = 0o007;
export const S_IROTH = 0o004;
export const S_IWOTH = 0o002;
export const S_IXOTH = 0o001;
