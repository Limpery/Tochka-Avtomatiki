import cn from 'classnames'
import { trpc } from '../../lib/trpc'
import { countActiveFilters, useCatalogFilterStore } from '../../stores/catalogFilterStore'
import { Button } from '../Button'
import { Field } from '../Field'
import css from './index.module.scss'

// Почему drawer, а не сайдбар: фильтры нужны эпизодически, большую часть времени
// список занимает всю ширину; панель выезжает справа поверх контента.
export const FilterDrawerButton = () => {
  const applied = useCatalogFilterStore((s) => s.applied)
  const setDrawerOpen = useCatalogFilterStore((s) => s.setDrawerOpen)
  const count = countActiveFilters(applied)
  return (
    <button
      type="button"
      className={css.burger}
      onClick={() => {
        setDrawerOpen(true)
      }}
    >
      <span className={css.burgerIcon}>☰</span>
      Фильтры{count > 0 && <span className={css.burgerCount}>{count}</span>}
    </button>
  )
}

const IndustrySection = () => {
  const draft = useCatalogFilterStore((s) => s.draft)
  const setDraft = useCatalogFilterStore((s) => s.setDraft)
  const industries = trpc.listIndustries.useQuery()
  return (
    <section>
      <h3 className={css.sectionTitle}>Отрасль</h3>
      <div className={css.pills}>
        {industries.data?.map((i) => (
          <button
            key={i.slug}
            type="button"
            className={cn(css.pill, { [css.pillActive]: draft.industrySlug === i.slug })}
            onClick={() => {
              // Почему сбрасываем объект: типы объектов принадлежат отрасли,
              // старый выбор после смены отрасли стал бы невалидным.
              setDraft({
                industrySlug: draft.industrySlug === i.slug ? '' : i.slug,
                objectTypeSlug: '',
              })
            }}
          >
            {i.name}
          </button>
        ))}
      </div>
    </section>
  )
}

const ObjectTypeSection = () => {
  const draft = useCatalogFilterStore((s) => s.draft)
  const setDraft = useCatalogFilterStore((s) => s.setDraft)
  const objectTypes = trpc.listObjectTypes.useQuery(
    { industrySlug: draft.industrySlug || undefined },
    { enabled: !!draft.industrySlug },
  )
  if (!draft.industrySlug) {
    return null
  }
  return (
    <section>
      <h3 className={css.sectionTitle}>Тип объекта</h3>
      <div className={css.pills}>
        {objectTypes.data?.map((o) => (
          <button
            key={o.id}
            type="button"
            className={cn(css.pill, { [css.pillActive]: draft.objectTypeSlug === o.slug })}
            onClick={() => {
              setDraft({ objectTypeSlug: draft.objectTypeSlug === o.slug ? '' : o.slug })
            }}
          >
            {o.name}
          </button>
        ))}
      </div>
    </section>
  )
}

const CategoryTagsSection = () => {
  const draft = useCatalogFilterStore((s) => s.draft)
  const setDraft = useCatalogFilterStore((s) => s.setDraft)
  const toggleTag = useCatalogFilterStore((s) => s.toggleTag)
  const filters = trpc.listCatalogFilters.useQuery()
  return (
    <>
      <section>
        <h3 className={css.sectionTitle}>Категория</h3>
        <select
          className={css.select}
          value={draft.categorySlug}
          onChange={(e) => {
            setDraft({ categorySlug: e.target.value })
          }}
        >
          <option value="">Все категории</option>
          {filters.data?.categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </section>
      <section>
        <h3 className={css.sectionTitle}>Теги</h3>
        <div className={css.checks}>
          {filters.data?.tags.map((t) => (
            <label key={t.slug} className={css.check}>
              <input
                type="checkbox"
                checked={draft.tagSlugs.includes(t.slug)}
                onChange={() => {
                  toggleTag(t.slug)
                }}
              />
              {t.name}
            </label>
          ))}
        </div>
      </section>
    </>
  )
}

const PriceSection = () => {
  const draft = useCatalogFilterStore((s) => s.draft)
  const setDraft = useCatalogFilterStore((s) => s.setDraft)
  return (
    <section>
      <h3 className={css.sectionTitle}>Цена, ₽</h3>
      <div className={css.priceRow}>
        <Field label="От">
          <input
            value={draft.priceMin}
            inputMode="numeric"
            placeholder="0"
            onChange={(e) => {
              setDraft({ priceMin: e.target.value })
            }}
          />
        </Field>
        <Field label="До">
          <input
            value={draft.priceMax}
            inputMode="numeric"
            placeholder="∞"
            onChange={(e) => {
              setDraft({ priceMax: e.target.value })
            }}
          />
        </Field>
      </div>
    </section>
  )
}

export const FilterDrawer = () => {
  const open = useCatalogFilterStore((s) => s.drawerOpen)
  const setDrawerOpen = useCatalogFilterStore((s) => s.setDrawerOpen)
  const apply = useCatalogFilterStore((s) => s.apply)
  const reset = useCatalogFilterStore((s) => s.reset)
  if (!open) {
    return null
  }
  const close = () => {
    setDrawerOpen(false)
  }
  return (
    <div className={css.overlay}>
      <button type="button" aria-label="Закрыть фильтры" className={css.backdrop} onClick={close} />
      <aside className={css.drawer}>
        <div className={css.drawerHead}>
          <h2 className={css.drawerTitle}>Фильтры</h2>
          <button type="button" className={css.close} onClick={close}>
            ✕
          </button>
        </div>
        <div className={css.drawerBody}>
          <IndustrySection />
          <ObjectTypeSection />
          <CategoryTagsSection />
          <PriceSection />
        </div>
        <div className={css.drawerFoot}>
          <Button
            onClick={() => {
              apply()
            }}
          >
            Применить
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset()
            }}
          >
            Сбросить
          </Button>
        </div>
      </aside>
    </div>
  )
}
