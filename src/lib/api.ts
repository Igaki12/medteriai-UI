export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type DummyJob = {
  jobId: string;
  createdAt: number;
  durationMs: number;
  explanationName: string;
  fileName?: string;
};

const DUMMY_JOBS_KEY = "dummy_pipeline_jobs";

function loadDummyJobs(): DummyJob[] {
  try {
    const raw = localStorage.getItem(DUMMY_JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DummyJob[];
  } catch {
    return [];
  }
}

function saveDummyJobs(jobs: DummyJob[]) {
  localStorage.setItem(DUMMY_JOBS_KEY, JSON.stringify(jobs));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createJobId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `pipeline-${Date.now().toString(36)}-${rand}`;
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => resolve(), ms);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true }
      );
    }
  });
}

function getJobById(jobId: string) {
  const jobs = loadDummyJobs();
  return jobs.find((job) => job.jobId === jobId);
}

function computeStatus(job: DummyJob) {
  const elapsed = Date.now() - job.createdAt;
  const progress = Math.min(1, Math.max(0, elapsed / job.durationMs));

  if (progress < 0.2) {
    return { status: "queued", message: "受付済みです。順番に処理しています。" };
  }
  if (progress < 0.85) {
    return { status: "generating_md", message: "解説を生成しています（ダミー）。" };
  }
  if (progress < 1) {
    return { status: "generating_pdf", message: "PDF変換中です（ダミー）。" };
  }
  return { status: "done", message: "ダミーの解説PDFが完成しました。" };
}

export type StartLegacyPipelineParams = {
  apiKey?: string;
  file: File;
  explanationName: string;
  university: string;
  year: string;
  subject: string;
  author: string;
};

export async function startLegacyPipeline(params: StartLegacyPipelineParams) {
  await sleep(randomBetween(300, 900));

  const jobId = createJobId();
  const durationMs = randomBetween(5_000, 30_000);
  const job: DummyJob = {
    jobId,
    createdAt: Date.now(),
    durationMs,
    explanationName: params.explanationName,
    fileName: params.file?.name
  };

  const jobs = loadDummyJobs();
  jobs.unshift(job);
  saveDummyJobs(jobs);

  return {
    job_id: jobId,
    status: "queued",
    message: "ジョブを受付しました（ダミー）。"
  };
}

export async function getJobStatus(jobId: string, signal?: AbortSignal) {
  await sleep(randomBetween(200, 700), signal);

  const job = getJobById(jobId);
  if (!job) {
    throw new ApiError("Job not found", 404);
  }

  return computeStatus(job);
}

export async function downloadResult(jobId: string) {
  await sleep(randomBetween(300, 800));

  const job = getJobById(jobId);
  if (!job) {
    throw new ApiError("Job not found", 404);
  }

  const status = computeStatus(job).status;
  if (status !== "done") {
    throw new ApiError("Result is not ready", 409);
  }

  const content = `Dummy PDF\n\njob_id: ${job.jobId}\nexplanation: ${job.explanationName}\nfile: ${job.fileName ?? "(unknown)"}\ncreated_at: ${new Date(job.createdAt).toLocaleString("ja-JP")}`;
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${job.explanationName || job.jobId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
