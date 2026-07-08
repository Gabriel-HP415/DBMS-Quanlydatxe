import { SimulationRepository } from '../repositories/simulation.repository';

const repo = new SimulationRepository();

export class SimulationService {
  getStatus() {
    return repo.getStats();
  }

  reset() {
    return repo.reset();
  }

  getLogs(limit?: number) {
    return repo.getRecentLogs(limit);
  }

  getDeadlockLogs(limit?: number) {
    return repo.getDeadlockLogs(limit);
  }
}