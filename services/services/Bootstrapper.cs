using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Nancy;
using ServiceStack.Text;

namespace services
{
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(Nancy.TinyIoc.TinyIoCContainer container, Nancy.Bootstrapper.IPipelines pipelines)
        {
            JsConfig.EmitCamelCaseNames = true;
            base.ApplicationStartup(container, pipelines);
        }
    }
}