FROM oven/bun:1.3.13-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
ARG TARGETARCH
# The committed lockfile was generated on Windows and omits Linux native
# optional packages. Install matching Alpine binaries without changing the lock.
RUN bun install --frozen-lockfile \
 && rollup_version="$(bun -p 'require("rollup/package.json").version')" \
 && esbuild_version="$(bun -p 'require("esbuild/package.json").version')" \
 && case "${TARGETARCH:-amd64}" in \
      amd64) bun_arch=x64 ;; \
      arm64) bun_arch=arm64 ;; \
      *) echo "Unsupported Docker architecture: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
 && bun install --no-save \
      "@rollup/rollup-linux-${bun_arch}-musl@${rollup_version}" \
      "@esbuild/linux-${bun_arch}@${esbuild_version}"
COPY . .
RUN bun run build
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
