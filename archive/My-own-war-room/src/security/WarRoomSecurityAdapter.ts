/**
 * Compatibility entry point for the WarRoom integration.
 *
 * The canonical adapter implementation lives in ./WarRoomAdapter.
 * Keeping this module as a re-export prevents two divergent SecurityEngine
 * presentation paths from existing in the repository.
 */
export {
  runWarRoomSecuritySimulation,
} from './WarRoomAdapter';

export type {
  WarRoomAdapterOutput as WarRoomSecurityRun,
} from './WarRoomAdapter';
