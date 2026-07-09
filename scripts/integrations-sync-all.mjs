#!/usr/bin/env node
/**
 * Sincroniza HaiSales + HaiSupport hacia HaiStore (CLI).
 * Requiere SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY en .env
 */
import 'dotenv/config';

import { syncAllIntegrations } from '../server/lib/integrations-orchestrator.js';

const mirrorRemote = process.argv.includes('--mirror-remote');

try {
  const result = await syncAllIntegrations({ mirrorRemote });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
