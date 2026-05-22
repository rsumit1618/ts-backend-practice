/**
 * BaseRepository - Generic repository base class
 * 
 * This abstract class defines the interface for all repositories.
 * It ensures consistency across different data sources (database, cache, etc.)
 * 
 * In production, you might have:
 * - UserRepository extends BaseRepository (in-memory or PostgreSQL)
 * - ProductRepository extends BaseRepository (MongoDB)
 * - CacheRepository extends BaseRepository (Redis)
 */
abstract class BaseRepository<T> {
  abstract create(item: T): Promise<T>;
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract update(id: string, item: T): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

export default BaseRepository;
