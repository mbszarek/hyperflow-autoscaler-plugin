FROM mbszarek/base-image

EXPOSE 8080

COPY . /hyperflow-autoscaler-plugin

WORKDIR /hyperflow-autoscaler-plugin

RUN yarn boot && lerna link convert && lerna run build && npm install -g /hyperflow-autoscaler-plugin/packages/autoscaler-engine && npm install -g /hyperflow-autoscaler-plugin/packages/standalone-autoscaler-plugin
