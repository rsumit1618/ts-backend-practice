abstract class BaseRepository<T> {
    abstract create(item: T): Promise<T>;
    abstract findAll(): Promise<T[]>;
}

export default BaseRepository;