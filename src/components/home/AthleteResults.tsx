import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProgressPoint {
  week: number;
  value: number;
}

const results = [
  {
    initials: "J.T.", age: "16 · RHP", before: "74 MPH", after: "82 MPH", gain: "+8 MPH", metric: "Pitch Velocity", weeks: 12,
    progress: [
      { week: 1, value: 74 }, { week: 3, value: 75 }, { week: 6, value: 77 },
      { week: 9, value: 79 }, { week: 12, value: 82 },
    ],
  },
  {
    initials: "M.R.", age: "15 · OF", before: "72 MPH", after: "79 MPH", gain: "+7 MPH", metric: "Exit Velocity", weeks: 8,
    progress: [
      { week: 1, value: 72 }, { week: 3, value: 73 }, { week: 6, value: 76 },
      { week: 8, value: 79 },
    ],
  },
  {
    initials: "C.A.", age: "14 · SS/RHP", before: "66 MPH", after: "72 MPH", gain: "+6 MPH", metric: "Pitch Velocity", weeks: 12,
    progress: [
      { week: 1, value: 66 }, { week: 4, value: 67 }, { week: 6, value: 69 },
      { week: 9, value: 70 }, { week: 12, value: 72 },
    ],
  },
  {
    initials: "D.P.", age: "17 · C", before: "2.15s", after: "1.98s", gain: "-0.17s", metric: "Pop Time", weeks: 8,
    progress: [
      { week: 1, value: 2.15 }, { week: 3, value: 2.10 }, { week: 6, value: 2.03 },
      { week: 8, value: 1.98 },
    ],
  },
  {
    initials: "A.W.", age: "13 · RHP", before: "58 MPH", after: "64 MPH", gain: "+6 MPH", metric: "Pitch Velocity", weeks: 12,
    progress: [
      { week: 1, value: 58 }, { week: 4, value: 59 }, { week: 6, value: 61 },
      { week: 9, value: 62 }, { week: 12, value: 64 },
    ],
  },
  {
    initials: "K.B.", age: "16 · 1B/OF", before: "78 MPH", after: "87 MPH", gain: "+9 MPH", metric: "Exit Velocity", weeks: 10,
    progress: [
      { week: 1, value: 78 }, { week: 3, value: 80 }, { week: 6, value: 83 },
      { week: 9, value: 85 }, { week: 10, value: 87 },
    ],
  },
];

function MiniProgressChart({ progress, maxWeeks }: { progress: ProgressPoint[]; maxWeeks: number }) {
  const values = progress.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const height = 48;
  const width = 160;

  const points = progress.map((p) => {
    const x = (p.week / maxWeeks) * width;
    const y = height - ((p.value - min) / range) * (height - 8) - 4;
    return { x, y, ...p };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
        {/* Grid lines */}
        <line x1="0" y1={height} x2={width} y2={height} stroke="hsl(var(--border))" strokeWidth="0.5" />
        {/* Progress line */}
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points with labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
            <text
              x={p.x}
              y={p.y - 7}
              textAnchor="middle"
              className="fill-foreground"
              fontSize="7"
              fontWeight="bold"
              fontFamily="var(--font-display, system-ui)"
            >
              {Number.isInteger(p.value) ? p.value : p.value.toFixed(2)}
            </text>
            <text
              x={p.x}
              y={height + 9}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="6"
              fontFamily="var(--font-display, system-ui)"
            >
              W{p.week}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const AthleteResults = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">ATHLETE DEVELOPMENT RESULTS</span>
            <h2 className="text-3xl md:text-5xl font-display text-foreground mb-3">MEASURABLE GAINS. REAL ATHLETES.</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              These results come from athletes following structured Vault programming. Names abbreviated for privacy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display text-foreground">{r.initials}</p>
                    <p className="text-[11px] text-muted-foreground">{r.age}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-foreground text-primary-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm font-display">{r.gain}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground">{r.metric}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{r.before}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{r.after}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground">{r.weeks} WEEKS</span>
                </div>
                <MiniProgressChart progress={r.progress} maxWeeks={r.weeks} />
              </motion.div>
            ))}

          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-6 italic">
            Results represent individual athlete progress. Names abbreviated for privacy. School names fictionalized.
          </p>

          <div className="text-center mt-8">
            <Button
              variant="vault"
              size="lg"
              className="font-display tracking-wide"
              onClick={() => navigate("/evaluate")}
            >
              START YOUR ATHLETE'S EVALUATION
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AthleteResults;
