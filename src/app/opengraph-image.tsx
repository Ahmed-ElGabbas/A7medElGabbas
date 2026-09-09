import { ImageResponse } from "next/og";
import { personalInfo, stats } from "@/data/portfolio";

export const runtime = "nodejs";

export const alt = `${personalInfo.name} — Full-Stack Developer & Mobile Engineer`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: "#05070a",
          backgroundImage:
            "radial-gradient(circle at 50% 10%, rgba(212, 175, 55, 0.18) 0%, rgba(5, 7, 10, 0) 65%), radial-gradient(circle at 90% 90%, rgba(212, 175, 55, 0.08) 0%, rgba(5, 7, 10, 0) 50%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle decorative outer frame */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            right: "24px",
            bottom: "24px",
            border: "1px solid rgba(212, 175, 55, 0.25)",
            borderRadius: "20px",
            pointerEvents: "none",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <span
              style={{
                color: "#10b981",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {personalInfo.status} • {personalInfo.location}
            </span>
          </div>

          {/* Domain tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#d4af37",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            <span>PORTFOLIO</span>
            <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>/</span>
            <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>ROBOTICS & WEB</span>
          </div>
        </div>

        {/* Center Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginTop: "20px",
          }}
        >
          {/* Main Name Heading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              fontSize: "76px",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#ffffff" }}>{personalInfo.firstName}</span>
            <span
              style={{
                color: "#d4af37",
                backgroundImage: "linear-gradient(135deg, #f5d76e 0%, #d4af37 60%, #aa820a 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
              }}
            >
              {personalInfo.lastName}
            </span>
          </div>

          {/* Role Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: "#e2e8f0",
              fontWeight: 500,
              letterSpacing: "-0.5px",
            }}
          >
            Full-Stack Software Engineer & Mobile Application Developer
          </div>

          {/* Core Specialization Pillars */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            {["Flutter & Dart", "React & Next.js", "ASP.NET Core", "Robotics & AI"].map(
              (tech) => (
                <div
                  key={tech}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {tech}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom Metrics & Website Link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            width: "100%",
          }}
        >
          {/* Key Metric Numbers */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "#d4af37",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Website Domain Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#d4af37",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#d4af37",
                letterSpacing: "0.5px",
              }}
            >
              ahmedelgabbas.dev
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
