import fs from 'node:fs';

const p = 'src/pages/category.tsx';
let s = fs.readFileSync(p, 'utf8');

s = s.replace('  buildBrandFacets,', '  buildBrandFilterOptions,');

s = s.replace(
  '  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);',
  `  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const raw = searchParams.get('marca');
    if (!raw?.trim()) return [];
    return [raw.trim().toLowerCase()];
  });`,
);

s = s.replace(
  '    return buildBrandFacets(baseProducts);',
  '    return buildBrandFilterOptions(baseProducts);',
);

const oldBlock = `      {brandFilterOptions.length > 0 ? (
        <CatalogFilterSection
          title="Marcas"
          labelClassName={filterSectionLabelClass}
          openWhenActive={selectedBrands.length > 0}
        >
          <CatalogFilterGroup className="max-h-48 overflow-y-auto">
            {brandFilterOptions.map((brand: { key: string; label: string; count: number }) => (
              <CatalogFilterOption
                key={brand.key}
                id={\`filter-brand-\${brand.key}\`}
                label={brand.label}
                count={brand.count}
                active={selectedBrands.includes(brand.key)}
                compact
                disabled={brand.count === 0}
                onToggle={() => toggleBrand(brand.key)}
              />
            ))}
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}`;

const newBlock = `      <CatalogFilterSection
        title="Marca"
        labelClassName={filterSectionLabelClass}
        openWhenActive={selectedBrands.length > 0}
      >
        <CatalogFilterGroup className="max-h-48 overflow-y-auto">
          {brandFilterOptions.map((brand: { key: string; label: string; count: number }) => (
            <CatalogFilterOption
              key={brand.key}
              id={\`filter-brand-\${brand.key}\`}
              label={brand.label}
              count={brand.count}
              active={selectedBrands.includes(brand.key)}
              compact
              disabled={brand.count === 0}
              onToggle={() => toggleBrand(brand.key)}
            />
          ))}
        </CatalogFilterGroup>
      </CatalogFilterSection>`;

if (!s.includes(oldBlock)) {
  console.error('block not found');
  process.exit(1);
}

s = s.replace(oldBlock, newBlock);
fs.writeFileSync(p, s);
console.log('patched', p);
