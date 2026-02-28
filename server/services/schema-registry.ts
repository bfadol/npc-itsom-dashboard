export interface FieldDef {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface SourceSchema {
  sourceId: string;
  name: string;
  requiredFields: FieldDef[];
  optionalFields: FieldDef[];
}

/** Minimal schema registry — validates uploaded data has expected structure */
const schemas: Map<string, SourceSchema> = new Map();

// Most sources accept dashboard-format JSON (single object with nested sections)
// Only define field-level validation for tabular (CSV/XLSX) uploads
function register(schema: SourceSchema): void {
  schemas.set(schema.sourceId, schema);
}

// Register known sources
register({
  sourceId: 'itsm/incidents',
  name: 'ITSM Incidents',
  requiredFields: [
    { name: 'kpis', type: 'string' },
    { name: 'responseSLA', type: 'string' },
  ],
  optionalFields: [
    { name: 'heatmap', type: 'string' },
    { name: 'weeklyTrend', type: 'string' },
  ],
});

register({
  sourceId: 'optimization/finops',
  name: 'FinOps',
  requiredFields: [
    { name: 'executiveOverview', type: 'string' },
    { name: 'budgetVsConsumption', type: 'string' },
  ],
  optionalFields: [
    { name: 'recommendations', type: 'string' },
  ],
});

export function getSchema(sourceId: string): SourceSchema | undefined {
  return schemas.get(sourceId);
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Validate parsed data against schema. Lenient — warns but doesn't block if schema is unknown */
export function validate(sourceId: string, data: Record<string, unknown>): ValidationResult {
  const schema = schemas.get(sourceId);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema) {
    warnings.push(`No schema registered for "${sourceId}" — skipping field validation`);
    return { valid: true, errors, warnings };
  }

  for (const field of schema.requiredFields) {
    if (!(field.name in data)) {
      errors.push(`Missing required field: "${field.name}"`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
