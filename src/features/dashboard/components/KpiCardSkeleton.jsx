import styles from './KpiCardSkeleton.module.css'

export default function KpiCardSkeleton() {
  return (
    <section className={styles.grid} aria-label="Loading key performance indicators">
      {Array.from({ length: 4 }, (_, index) => (
        <div className={styles.card} key={index} aria-hidden="true">
          <span className={styles.line} />
          <span className={styles.value} />
          <span className={styles.line} />
        </div>
      ))}
    </section>
  )
}
