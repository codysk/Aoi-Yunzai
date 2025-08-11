#!/usr/bin/env bash

# chdir to script dir
cd "$(dirname "$0")" || exit 1

echo "Launching napcat server"

docker compose -f NapCat.yaml up -d

{
    # 等待 NapCat 服务就绪（检测 6099 端口）
    echo "正在等待 NapCat 启动..."
    timeout=600  # 最大等待时间（秒）
    start_time=$(date +%s)

    while ! nc -z localhost 6099; do
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))

        if [ $elapsed -ge $timeout ]; then
            echo "超时警告: NapCat $timeout 秒内未能启动成功！"
            exit 1
        fi
        sleep 1
    done

    # 服务已就绪，打开浏览器
    if [ -n "$BROWSER" ]; then
        echo "NapCat 已准备就绪！正在打开浏览器..."
        $BROWSER "http://localhost:6099"
    fi
}