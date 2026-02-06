"use client";

import { useState, useEffect } from "react";
import apiClient from "@/libs/api";
import config from "@/config";
import ButtonCheckout from "@/components/ButtonCheckout";
import { useDictionary } from "@/i18n/dictionary-provider";

interface UsageData {
  plan: { name: string; priceId: string; limits: { messagesPerMonth: number; templates: number } } | null;
  usage: {
    messagesThisMonth: number;
    messagesLimit: number;
    templates: number;
    templatesLimit: number;
  };
  hasAccess: boolean;
}

export default function BillingPage() {
  const { dict } = useDictionary();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data: UsageData = await apiClient.get("/usage");
        setUsageData(data);
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-portal",
        { returnUrl: window.location.href },
      );
      window.location.href = url;
    } catch (error) {
      console.error("Failed to open portal:", error);
    } finally {
      setIsPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const hasSubscription = usageData?.hasAccess && usageData?.plan;
  const usage = usageData?.usage;
  const plan = usageData?.plan;

  const messagesPercentage =
    usage && usage.messagesLimit > 0
      ? Math.round((usage.messagesThisMonth / usage.messagesLimit) * 100)
      : 0;

  const templatesPercentage =
    usage && usage.templatesLimit > 0
      ? Math.round((usage.templates / usage.templatesLimit) * 100)
      : 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{dict.billing.title}</h1>
            <p className="text-base-content/60 mt-1">
              {dict.billing.pageDescription}
            </p>
          </div>

          {hasSubscription ? (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        {dict.billing.currentPlan}
                      </h2>
                      <div className="badge badge-primary badge-lg mt-2">
                        {plan!.name}
                      </div>
                    </div>
                    <button
                      className="btn btn-outline btn-primary"
                      onClick={handleManageSubscription}
                      disabled={isPortalLoading}
                    >
                      {isPortalLoading && (
                        <span className="loading loading-spinner loading-xs"></span>
                      )}
                      {dict.billing.manageSubscription}
                    </button>
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                  <h2 className="text-xl font-bold mb-4">{dict.billing.usage}</h2>

                  <div className="space-y-6">
                    {/* Messages */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">
                          {dict.billing.messagesThisMonth}
                        </span>
                        <span className="font-semibold">
                          {usage!.messagesThisMonth}{" "}
                          {usage!.messagesLimit === -1
                            ? `(${dict.billing.unlimited})`
                            : `/ ${usage!.messagesLimit}`}
                        </span>
                      </div>
                      {usage!.messagesLimit === -1 ? (
                        <progress
                          className="progress progress-success w-full"
                          value={100}
                          max="100"
                        ></progress>
                      ) : (
                        <progress
                          className={`progress w-full ${messagesPercentage > 80 ? "progress-warning" : "progress-primary"}`}
                          value={messagesPercentage}
                          max="100"
                        ></progress>
                      )}
                    </div>

                    {/* Templates */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">
                          {dict.billing.templates}
                        </span>
                        <span className="font-semibold">
                          {usage!.templates}{" "}
                          {usage!.templatesLimit === -1
                            ? `(${dict.billing.unlimited})`
                            : `/ ${usage!.templatesLimit}`}
                        </span>
                      </div>
                      {usage!.templatesLimit === -1 ? (
                        <progress
                          className="progress progress-success w-full"
                          value={100}
                          max="100"
                        ></progress>
                      ) : (
                        <progress
                          className={`progress w-full ${templatesPercentage > 80 ? "progress-warning" : "progress-primary"}`}
                          value={templatesPercentage}
                          max="100"
                        ></progress>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* No Subscription Banner */}
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">{dict.billing.noPlan}</h3>
                  <div className="text-sm">{dict.billing.noPlanDescription}</div>
                </div>
              </div>

              {/* Plans */}
              <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-8 justify-center">
                {config.stripe.plans.map((plan) => (
                  <div key={plan.priceId} className="relative w-full max-w-lg">
                    {plan.isFeatured && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <span className="badge text-xs text-primary-content font-semibold border-0 bg-primary">
                          {dict.pricing.popular}
                        </span>
                      </div>
                    )}
                    {plan.isFeatured && (
                      <div className="absolute -inset-[1px] rounded-[9px] bg-primary z-10"></div>
                    )}
                    <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg border border-base-300">
                      <div>
                        <p className="text-lg lg:text-xl font-bold">
                          {plan.name}
                        </p>
                        {plan.description && (
                          <p className="text-base-content/80 mt-2">
                            {plan.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {plan.priceAnchor && (
                          <div className="flex flex-col justify-end mb-[4px] text-lg">
                            <p className="relative">
                              <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                              <span className="text-base-content/80">
                                ${plan.priceAnchor}
                              </span>
                            </p>
                          </div>
                        )}
                        <p className="text-5xl tracking-tight font-extrabold">
                          ${plan.price}
                        </p>
                        <div className="flex flex-col justify-end mb-[4px]">
                          <p className="text-xs text-base-content/60 uppercase font-semibold">
                            {dict.pricing.usd}
                          </p>
                        </div>
                      </div>
                      {plan.features && (
                        <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-[18px] h-[18px] opacity-80 shrink-0"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{feature.name}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <ButtonCheckout priceId={plan.priceId} mode="subscription" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
