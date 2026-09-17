package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** FAQ VO：由 site_content 的 group=faq 解析而来。 */
public class FaqVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 序号。 */
    private Integer seq;

    /** 问题。 */
    private String question;

    /** 答案。 */
    private String answer;

    public FaqVO() {
    }

    public FaqVO(Integer seq, String question, String answer) {
        this.seq = seq;
        this.question = question;
        this.answer = answer;
    }

    public Integer getSeq() {
        return seq;
    }

    public void setSeq(Integer seq) {
        this.seq = seq;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
